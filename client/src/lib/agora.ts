import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from 'agora-rtc-sdk-ng';

// Agora App ID (Priority: User provided key -> Environment variable -> Fallback)
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || 'f48e44adf06a425a869ebebd62e90ad2';

export interface AgoraConfig {
  appId?: string;
  channel: string;
  token?: string;
  uid?: string | number;
}

export interface AgoraTrack {
  videoTrack?: ICameraVideoTrack;
  audioTrack?: IMicrophoneAudioTrack;
}

export class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localTracks: AgoraTrack = {};
  private remoteUsers: Map<string | number, {
    videoTrack?: IRemoteVideoTrack;
    audioTrack?: IRemoteAudioTrack;
  }> = new Map();

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
      // In Demo v0.5, if token is not provided, we pass null (assuming App ID mode or token server not yet ready)
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
   * Play local video track in a DOM element
   */
  playLocalVideo(elementId: string): void {
    if (this.localTracks.videoTrack) {
      this.localTracks.videoTrack.play(elementId);
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
}

// Export singleton instance
export const agoraService = new AgoraService();
