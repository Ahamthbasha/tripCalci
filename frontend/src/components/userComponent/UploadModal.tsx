import React, { useState } from 'react';
import { X, Upload, File, Loader2, AlertCircle } from 'lucide-react';
import * as yup from 'yup';
import type { UploadModalProps } from './interface/IUser';

const validationSchema = yup.object({
  tripName: yup
    .string()
    .required('Trip name is required')
    .trim()
    .min(5, 'Trip name must be at least 5 characters long')
    .test(
      'has-five-letters',
      'Trip name must contain at least 5 alphabetic letters (A-Z)',
      (value) => {
        if (!value) return false;
        const letterCount = (value.match(/[a-zA-Z]/g) || []).length;
        return letterCount >= 5;
      }
    )
    .matches(
      /^[a-zA-Z0-9\s\-_&.,()]+$/,
      'Only letters, numbers, spaces, and common symbols (- _ & . , ( )) are allowed'
    ),
  file: yup
    .mixed<File>()
    .required('A file is required')
    .test('fileFormat', 'Only CSV or Excel files (.csv, .xlsx, .xls) are allowed', (file) => {
      if (!file) return false;
      const allowed = ['.csv', '.xlsx', '.xls'];
      return allowed.some(ext => file.name.toLowerCase().endsWith(ext));
    }),
});

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [tripName, setTripName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ tripName?: string; file?: string }>({});

  if (!isOpen) return null;

  const validate = async () => {
    try {
      await validationSchema.validate(
        { tripName: tripName.trim(), file: selectedFile },
        { abortEarly: false }
      );
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: { tripName?: string; file?: string } = {};
        err.inner.forEach((error) => {
          if (error.path === 'tripName') newErrors.tripName = error.message;
          if (error.path === 'file') newErrors.file = error.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setErrors(prev => ({ ...prev, file: undefined }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSave = async () => {
    const isValid = await validate();
    if (isValid && selectedFile) {
      onSave(tripName.trim(), selectedFile);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      setTripName('');
      setSelectedFile(null);
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Modal Card - only this part captures clicks */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition"
        >
          <X size={24} />
        </button>

        {/* Modal Content */}
        <div className="p-8 pt-12 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Upload Trip</h2>

          {/* Trip Name */}
          <div>
            <input
              type="text"
              placeholder="Trip Name* (e.g. Chennai - Bangalore)"
              value={tripName}
              onChange={(e) => {
                setTripName(e.target.value);
                setErrors(prev => ({ ...prev, tripName: undefined }));
              }}
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.tripName
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
              } disabled:bg-gray-100`}
            />
            {errors.tripName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.tripName}
              </p>
            )}
          </div>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-50' :
              selectedFile ? 'border-green-500 bg-green-50' :
              'border-gray-300 bg-gray-50 hover:bg-gray-100'
            } ${isLoading ? 'opacity-50' : ''}`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              disabled={isLoading}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <File size={40} className="text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload size={48} className="mx-auto mb-4 text-blue-500" />
                <label htmlFor="file-upload" className="block">
                  <span className="text-blue-600 hover:text-blue-700 font-semibold text-lg">
                    Click to upload
                  </span>
                  <span className="text-gray-600 block mt-1">or drag and drop</span>
                </label>
                <p className="text-sm text-gray-500 mt-3">
                  Only CSV or Excel files (.csv, .xlsx, .xls)
                </p>
              </>
            )}

            {errors.file && (
              <p className="mt-4 text-sm text-red-600 flex items-center justify-center gap-1">
                <AlertCircle size={16} />
                {errors.file}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Trip'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;