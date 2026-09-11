import { useState, useEffect } from 'react';
import { sliderService } from '../../services/sliderService';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const Sliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    sortOrder: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

    setSaving(true);
    try {
      const payload = new FormData();
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
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSlider(null);
    setFormData({ sortOrder: 0, isActive: true });
    setImageFile(null);
    setImagePreview(null);
    setSaving(false);
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
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
      payload.append('sortOrder', (slider.sortOrder || 0).toString());
      payload.append('isActive', (!slider.isActive).toString());
      await sliderService.update(slider._id, payload);
      fetchSliders();
    } catch (error) {
      console.error('Failed to toggle slider:', error);
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
          <p className="text-sm text-gray-500">Loading sliders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="page-title">Home Page Sliders</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage carousel images displayed on the mobile app home screen
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingSlider(null);
          }}
          className="btn-primary"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Slider Image
        </button>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <div className="p-4 flex gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> These images will be displayed as a carousel on the home screen of the mobile app. Use high-quality images with 16:9 aspect ratio for best results.
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="section-title">
              {editingSlider ? 'Edit Slider' : 'Add New Slider'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {editingSlider ? 'Update slider details below' : 'Add a new slider image to the carousel'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="label">
                Slider Image {!editingSlider && <span className="text-red-500">*</span>}
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v12m0 0v4m0-4H28m4 12h4m-16.5-6.5l-3.5 3.5m0 0l-3.5-3.5m3.5 3.5V34" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>Upload an image</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported: JPG, PNG, WEBP, GIF (max 5MB). {editingSlider && 'Leave empty to keep current image.'}
                  </p>
                </div>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-40 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="input"
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
                ) : editingSlider ? (
                  'Update Slider'
                ) : (
                  'Create Slider'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {sliders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-16 w-16 text-gray-300">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No slider images yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your first slider image to display on the home screen carousel.
            </p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sliders.map((slider) => (
              <div key={slider._id} className="card overflow-hidden">
                <div className="relative">
                  <img
                    src={`${API_BASE_URL}${slider.image}`}
                    alt={slider.title || 'Slider'}
                    className="w-full h-40 object-cover"
                  />
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded ${
                      slider.isActive
                        ? 'badge-success'
                        : 'badge-danger'
                    }`}
                  >
                    {slider.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded bg-gray-900/70 text-white">
                    Order: {slider.sortOrder}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => toggleActive(slider)}
                      className={`flex-1 text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${
                        slider.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {slider.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(slider)}
                      className="text-xs px-2 py-1.5 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slider._id)}
                      className="text-xs px-2 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium"
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