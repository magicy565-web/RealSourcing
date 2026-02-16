import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Save, Calendar, Users, Video, Tag } from 'lucide-react';

interface WebinarFormData {
  title: string;
  subtitle: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  host_name: string;
  host_avatar: string;
  max_participants: number;
  video_url: string;
  meeting_type: string;
  tags: string[];
}

export default function AdminWebinarForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const isEdit = id !== 'new';

  const [formData, setFormData] = useState<WebinarFormData>({
    title: '',
    subtitle: '',
    description: '',
    start_time: '',
    end_time: '',
    status: 'upcoming',
    host_name: '',
    host_avatar: '',
    max_participants: 20,
    video_url: '',
    meeting_type: 'sourcing',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchWebinar();
    }
  }, [id]);

  const fetchWebinar = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://47.99.205.136:8055/items/webinars/${id}`);
      const data = await response.json();
      setFormData({
        ...data.data,
        tags: data.data.tags || []
      });
    } catch (error) {
      console.error('Error fetching webinar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEdit
        ? `http://47.99.205.136:8055/items/webinars/${id}`
        : 'http://47.99.205.136:8055/items/webinars';
      
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setLocation('/admin');
      } else {
        alert('Failed to save webinar');
      }
    } catch (error) {
      console.error('Error saving webinar:', error);
      alert('Error saving webinar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F1E] text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] text-white">
      {/* Header */}
      <div className="bg-[#1A1A2E] border-b border-[#2A2A3E] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/admin')}
              className="p-2 hover:bg-[#2A2A3E] rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">
                {isEdit ? 'Edit Webinar' : 'Create New Webinar'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {isEdit ? `Editing webinar #${id}` : 'Fill in the details below'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-400" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="TikTok Hot Products Sourcing 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Spring Season Trending Products Showcase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  rows={4}
                  placeholder="Describe your webinar..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Meeting Type</label>
                  <select
                    value={formData.meeting_type}
                    onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  >
                    <option value="sourcing">Sourcing</option>
                    <option value="showcase">Showcase</option>
                    <option value="training">Training</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Host Information */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-400" />
              Host & Participants
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Host Name</label>
                <input
                  type="text"
                  value={formData.host_name}
                  onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Host Avatar URL</label>
                <input
                  type="url"
                  value={formData.host_avatar}
                  onChange={(e) => setFormData({ ...formData, host_avatar: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Participants</label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Video & Tags */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Video className="h-5 w-5 text-violet-400" />
              Media & Tags
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video URL</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#0F0F1E] border border-[#2A2A3E] rounded-full text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setLocation('/admin')}
              className="px-6 py-2 bg-[#2A2A3E] hover:bg-[#3A3A4E] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : isEdit ? 'Update Webinar' : 'Create Webinar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
