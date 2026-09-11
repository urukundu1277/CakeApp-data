import { useState, useEffect } from 'react';
import { announcementService } from '../../services/announcementService';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementService.getAll();
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      alert('Please enter a message');
      return;
    }
    setSaving(true);
    try {
      if (editingAnnouncement) {
        await announcementService.update(editingAnnouncement._id, formData);
      } else {
        await announcementService.create(formData);
      }
      fetchAnnouncements();
      resetForm();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      alert(error.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
    setFormData({ message: '', isActive: true, order: 0 });
    setSaving(false);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      message: announcement.message,
      isActive: announcement.isActive,
      order: announcement.order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementService.delete(id);
        fetchAnnouncements();
      } catch (error) {
        console.error('Failed to delete announcement:', error);
        alert(error.response?.data?.message || 'Failed to delete announcement');
      }
    }
  };

  const toggleActive = async (announcement) => {
    try {
      await announcementService.update(announcement._id, {
        ...announcement,
        isActive: !announcement.isActive,
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to toggle announcement:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="page-title">Announcement Banners</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage scrolling banner messages on the mobile app home screen
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingAnnouncement(null);
          }}
          className="btn-primary"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Banner Message
        </button>
      </div>

      <div className="card bg-yellow-50 border-yellow-200">
        <div className="p-4 flex gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Info:</strong> These messages will be displayed as a moving/scrolling banner on the home screen of the mobile app. Active messages will rotate automatically.
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="section-title">
              {editingAnnouncement ? 'Edit Banner Message' : 'Add Banner Message'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {editingAnnouncement ? 'Update the banner message below' : 'Create a new banner message'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="label">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input"
                rows="2"
                placeholder="e.g., 🎉 Free delivery on orders above ₹500! Order now."
                required
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.message.length}/200 characters
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="input"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              <div>
                <label className="label">Status</label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="text-sm text-gray-700">
                    {formData.isActive ? 'Active (will be shown in app)' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-700 font-medium">
                {formData.message || 'Your message will appear here'}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-success"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : editingAnnouncement ? (
                  'Update Message'
                ) : (
                  'Create Message'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {announcements.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-16 w-16 text-gray-300">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No announcements yet</h3>
            <p className="mt-1 text-sm text-gray-500">Add your first banner message to display on the home screen.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {announcements.map((announcement) => (
                  <tr key={announcement._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {announcement.order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md text-sm text-gray-700">{announcement.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(announcement)}
                        className={`badge cursor-pointer transition-colors ${
                          announcement.isActive
                            ? 'badge-success hover:bg-emerald-200'
                            : 'badge-danger hover:bg-red-200'
                        }`}
                      >
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(announcement)}
                          className="text-primary-600 hover:text-primary-900 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(announcement._id)}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
