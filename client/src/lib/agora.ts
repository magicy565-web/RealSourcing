import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';

// Agora App ID (Priority: User provided key -> Environment variable -> Fallback)
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || '0deed6e0ce284935b09babccaa5eb882';

export interface AgoraConfig {
  appId?: string;
  channel: string;
  token?: string;
  uid?: string | number;
}

export interface AgoraTrack {
  videoTrack?: ICameraVideoTrack;
  audioTrack?: IMicrophoneAudioTrack;
  screenTrack?: ILocalVideoTrack;
}

export class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localTracks: AgoraTrack = {};
  private remoteUsers: Map<string | number, {
    videoTrack?: IRemoteVideoTrack;
    audioTrack?: IRemoteAudioTrack;
  }> = new Map();
  private isScreenSharing: boolean = false;

  constructor() {
    // Set Agora log level
    AgoraRTC.setLogLevel(3); // 0: DEBUG, 1: INFO, 2: WARNING, 3: ERROR, 4: NONE
  }

  /**
   * Initialize Agora client
   */
  async init(config: AgoraConfig): Promise<void> {
    try {
      // Create Agora client
      this.client = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8',
      });

      // Register event handlers
      this.registerEventHandlers();

      const appId = config.appId || AGORA_APP_ID;
      
      if (!appId || appId === 'your-agora-app-id') {
        throw new Error('Invalid Agora App ID. Please check your configuration.');
      }

      // Join channel
      await this.client.join(
        appId,
        config.channel,
        config.token || null,
        config.uid || null
      );

      console.log('✅ Joined Agora channel:', config.channel);
    } catch (error) {
      console.error('❌ Failed to initialize Agora:', error);
      throw error;
    }
  }

  /**
   * Create and publish local audio and video tracks
   */
  async createLocalTracks(): Promise<AgoraTrack> {
    try {
      // Create microphone and camera tracks
      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      this.localTracks = { audioTrack, videoTrack };

      // Publish tracks to the channel
      if (this.client) {
        await this.client.publish([audioTrack, videoTrack]);
        console.log('✅ Published local tracks');
      }

      return this.localTracks;
    } catch (error) {
      console.error('❌ Failed to create local tracks:', error);
      throw error;
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    if (this.isScreenSharing) {
      console.warn('Already screen sharing');
      return;
    }

    try {
      // Create screen track
      const screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: '1080p_1',
      }, 'auto');

      // If camera is currently published, unpublish it
      if (this.localTracks.videoTrack) {
        await this.client.unpublish([this.localTracks.videoTrack]);
      }

      // Publish screen track
      if (Array.isArray(screenTrack)) {
        // Screen track with audio
        await this.client.publish(screenTrack);
        this.localTracks.screenTrack = screenTrack[0];
      } else {
        // Screen track without audio
        await this.client.publish([screenTrack]);
        this.localTracks.screenTrack = screenTrack;
      }

      this.isScreenSharing = true;

      // Listen for screen share stop event
      this.localTracks.screenTrack.on('track-ended', () => {
        this.stopScreenShare();
      });

      console.log('✅ Started screen sharing');
    } catch (error) {
      console.error('❌ Failed to start screen sharing:', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    if (!this.client || !this.isScreenSharing || !this.localTracks.screenTrack) {
      return;
    }

    try {
      // Unpublish and close screen track
      await this.client.unpublish([this.localTracks.screenTrack]);
      this.localTracks.screenTrack.close();
      this.localTracks.screenTrack = undefined;

      // Re-publish camera track
      if (this.localTracks.videoTrack) {
        await this.client.publish([this.localTracks.videoTrack]);
      }

      this.isScreenSharing = false;
      console.log('✅ Stopped screen sharing');
    } catch (error) {
      console.error('❌ Failed to stop screen sharing:', error);
      throw error;
    }
  }

  /**
   * Toggle screen sharing
   */
  async toggleScreenShare(): Promise<boolean> {
    if (this.isScreenSharing) {
      await this.stopScreenShare();
      return false;
    } else {
      await this.startScreenShare();
      return true;
    }
  }

  /**
   * Check if currently screen sharing
   */
  isScreenSharingActive(): boolean {
    return this.isScreenSharing;
  }

  /**
   * Play local video track in a DOM element
   */
  playLocalVideo(elementId: string): void {
    const track = this.isScreenSharing ? this.localTracks.screenTrack : this.localTracks.videoTrack;
    if (track) {
      track.play(elementId);
    }
  }

  /**
   * Play remote video track in a DOM element
   */
  playRemoteVideo(uid: string | number, elementId: string): void {
    const remoteUser = this.remoteUsers.get(uid);
    if (remoteUser?.videoTrack) {
      remoteUser.videoTrack.play(elementId);
    }
  }

  /**
   * Mute/unmute local audio
   */
  async toggleAudio(mute: boolean): Promise<void> {
    if (this.localTracks.audioTrack) {
      await this.localTracks.audioTrack.setEnabled(!mute);
    }
  }

  /**
   * Mute/unmute local video
   */
  async toggleVideo(mute: boolean): Promise<void> {
    if (this.localTracks.videoTrack) {
      await this.localTracks.videoTrack.setEnabled(!mute);
    }
  }

  /**
   * Leave channel and clean up
   */
  async leave(): Promise<void> {
    try {
      // Stop screen sharing if active
      if (this.isScreenSharing) {
        await this.stopScreenShare();
      }

      // Close local tracks
      if (this.localTracks.audioTrack) {
        this.localTracks.audioTrack.close();
      }
      if (this.localTracks.videoTrack) {
        this.localTracks.videoTrack.close();
      }

      // Leave channel
      if (this.client) {
        await this.client.leave();
        console.log('✅ Left Agora channel');
      }

      // Clean up
      this.localTracks = {};
      this.remoteUsers.clear();
      this.client = null;
      this.isScreenSharing = false;
    } catch (error) {
      console.error('❌ Failed to leave channel:', error);
      throw error;
    }
  }

  /**
   * Register event handlers for remote users
   */
  private registerEventHandlers(): void {
    if (!this.client) return;

    // Handle user published event
    this.client.on('user-published', async (user, mediaType) => {
      await this.client!.subscribe(user, mediaType);
      console.log('✅ Subscribed to remote user:', user.uid);

      if (mediaType === 'video') {
        const remoteUser = this.remoteUsers.get(user.uid) || {};
        remoteUser.videoTrack = user.videoTrack;
        this.remoteUsers.set(user.uid, remoteUser);
      }

      if (mediaType === 'audio') {
        const remoteUser = this.remoteUsers.get(user.uid) || {};
        remoteUser.audioTrack = user.audioTrack;
        this.remoteUsers.set(user.uid, remoteUser);

        // Play audio automatically
        user.audioTrack?.play();
      }
    });

    // Handle user unpublished event
    this.client.on('user-unpublished', (user, mediaType) => {
      console.log('⚠️  Remote user unpublished:', user.uid, mediaType);
      if (mediaType === 'video') {
        const remoteUser = this.remoteUsers.get(user.uid);
        if (remoteUser) {
          delete remoteUser.videoTrack;
        }
      }
      if (mediaType === 'audio') {
        const remoteUser = this.remoteUsers.get(user.uid);
        if (remoteUser) {
          delete remoteUser.audioTrack;
        }
      }
    });

    // Handle user left event
    this.client.on('user-left', (user) => {
      console.log('⚠️  Remote user left:', user.uid);
      this.remoteUsers.delete(user.uid);
    });

    // Handle connection state change
    this.client.on('connection-state-change', (curState, prevState) => {
      console.log(`Connection state changed: ${prevState} -> ${curState}`);
    });

    // Handle network quality
    this.client.on('network-quality', (stats) => {
      console.log('Network quality:', stats);
    });
  }

  /**
   * Get all remote users
   */
  getRemoteUsers(): Array<{ uid: string | number; hasVideo: boolean; hasAudio: boolean }> {
    return Array.from(this.remoteUsers.entries()).map(([uid, user]) => ({
      uid,
      hasVideo: !!user.videoTrack,
      hasAudio: !!user.audioTrack,
    }));
  }

  /**
   * Get connection state
   */
  getConnectionState(): string {
    return this.client?.connectionState || 'DISCONNECTED';
  }
}

// Export singleton instance
export const agoraService = new AgoraService();
