import { useState, useEffect } from 'react';
import { sliderService } from '../../services/sliderService';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const Sliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    sortOrder: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await sliderService.getAll();
      setSliders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingSlider && !imageFile) {
      alert('Please select an image for the slider');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('link', formData.link);
      payload.append('sortOrder', formData.sortOrder.toString());
      payload.append('isActive', formData.isActive.toString());

      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingSlider) {
        await sliderService.update(editingSlider._id, payload);
      } else {
        await sliderService.create(payload);
      }

      fetchSliders();
      resetForm();
    } catch (error) {
      console.error('Failed to save slider:', error);
      alert(error.response?.data?.message || 'Failed to save slider');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSlider(null);
    setFormData({ title: '', description: '', link: '', sortOrder: 0, isActive: true });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title || '',
      description: slider.description || '',
      link: slider.link || '',
      sortOrder: slider.sortOrder || 0,
      isActive: slider.isActive,
    });
    setImageFile(null);
    setImagePreview(slider.image ? `${API_BASE_URL}${slider.image}` : null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        await sliderService.delete(id);
        fetchSliders();
      } catch (error) {
        console.error('Failed to delete slider:', error);
        alert(error.response?.data?.message || 'Failed to delete slider');
      }
    }
  };

  const toggleActive = async (slider) => {
    try {
      const payload = new FormData();
      payload.append('title', slider.title || '');
      payload.append('description', slider.description || '');
      payload.append('link', slider.link || '');
      payload.append('sortOrder', (slider.sortOrder || 0).toString());
      payload.append('isActive', (!slider.isActive).toString());
      await sliderService.update(slider._id, payload);
      fetchSliders();
    } catch (error) {
      console.error('Failed to toggle slider:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading sliders...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Home Page Sliders</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingSlider(null);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Slider Image
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <strong>Info:</strong> These images will be displayed as a carousel on the home screen
          of the mobile app. Use high-quality images with 16:9 aspect ratio for best results.
        </p>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold mb-4">
            {editingSlider ? 'Edit Slider' : 'Add New Slider'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="e.g., Summer Special"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Link/URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="e.g., /category/birthday"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows="2"
                placeholder="Short description"
              />
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Slider Image {!editingSlider && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <p className="text-gray-500 text-xs mt-1">
                Supported: JPG, PNG, WEBP, GIF (max 5MB). {editingSlider && 'Leave empty to keep current image.'}
              </p>
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-64 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
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

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingSlider ? 'Update Slider' : 'Create Slider'}
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
        {sliders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No slider images yet. Add your first slider image to display on the home screen carousel.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {sliders.map((slider) => (
              <div key={slider._id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="relative">
                  <img
                    src={`${API_BASE_URL}${slider.image}`}
                    alt={slider.title || 'Slider'}
                    className="w-full h-40 object-cover"
                  />
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                      slider.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {slider.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="absolute top-2 left-2 px-2 py-1 text-xs rounded bg-gray-800 text-white">
                    Order: {slider.sortOrder}
                  </span>
                </div>
                <div className="p-3">
                  {slider.title && (
                    <h4 className="font-bold text-sm mb-1">{slider.title}</h4>
                  )}
                  {slider.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{slider.description}</p>
                  )}
                  {slider.link && (
                    <p className="text-xs text-blue-600 mb-2">Link: {slider.link}</p>
                  )}
                  <div className="flex justify-between gap-2 mt-3">
                    <button
                      onClick={() => toggleActive(slider)}
                      className={`text-xs px-2 py-1 rounded flex-1 ${
                        slider.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {slider.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(slider)}
                      className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slider._id)}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sliders;
