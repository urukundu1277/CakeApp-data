import { useState, useEffect } from 'react';
import { announcementService } from '../../services/announcementService';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
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
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
    setFormData({ message: '', isActive: true, order: 0 });
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
    return <div className="text-center py-8">Loading announcements...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Announcement Banners</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingAnnouncement(null);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Banner Message
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
        <p className="text-yellow-800 text-sm">
          <strong>Info:</strong> These messages will be displayed as a moving/scrolling banner
          on the home screen of the mobile app. Active messages will rotate automatically.
        </p>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold mb-4">
            {editingAnnouncement ? 'Edit Banner Message' : 'Add Banner Message'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows="2"
                placeholder="e.g., 🎉 Free delivery on orders above ₹500! Order now."
                required
                maxLength={200}
              />
              <p className="text-gray-500 text-xs mt-1">
                {formData.message.length}/200 characters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="0"
                />
                <p className="text-gray-500 text-xs mt-1">Lower numbers appear first</p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2 w-4 h-4"
                  />
                  <span>Active (will be shown in app)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-1">Preview:</p>
              <div className="bg-orange-50 border border-orange-200 rounded p-3 text-orange-700 font-medium">
                {formData.message || 'Your message will appear here'}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {editingAnnouncement ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {announcements.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No announcements yet. Add your first banner message to display on the home screen.
                </td>
              </tr>
            ) : (
              announcements.map((announcement) => (
                <tr key={announcement._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {announcement.order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">{announcement.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(announcement)}
                      className={`px-2 py-1 text-xs rounded cursor-pointer ${
                        announcement.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Announcements;
