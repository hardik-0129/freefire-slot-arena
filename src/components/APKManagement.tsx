import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Search, 
  Upload, 
  Download, 
  Edit, 
  Trash, 
  Eye,
  RefreshCw,
  Plus,
  Smartphone,
  FileText,
  Calendar,
  User,
  HardDrive
} from "lucide-react";

interface APK {
  _id: string;
  name: string;
  version: string;
  description: string;
  fileName: string;
  fileSize: number;
  downloadCount: number;
  uploadDate: string;
  uploadedBy?: {
    name?: string;
    email?: string;
  } | null;
  metadata: {
    packageName: string;
    minSdkVersion: string;
    targetSdkVersion: string;
  };
}

const APKManagement = () => {
  const [apks, setApks] = useState<APK[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingApk, setEditingApk] = useState<APK | null>(null);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: '',
    version: '',
    description: '',
    packageName: '',
    minSdkVersion: '',
    targetSdkVersion: '',
    apkFile: null as File | null
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    version: '',
    description: '',
    packageName: '',
    minSdkVersion: '',
    targetSdkVersion: ''
  });

  // Fetch APKs from API
  const fetchApks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm
      });
      

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/apk?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApks(data.apks || []);
      } else {
        console.error('Failed to fetch APKs');
      }
    } catch (error) {
      console.error('Error fetching APKs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApks();
  }, [currentPage, searchTerm]);

  // Handle search on Enter key press
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchApks();
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, apkFile: file });
    }
  };

  // Upload new APK
  const handleUpload = async () => {
    if (!uploadForm.apkFile || !uploadForm.name || !uploadForm.version) {
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('apkFile', uploadForm.apkFile);
      formData.append('name', uploadForm.name);
      formData.append('version', uploadForm.version);
      formData.append('description', uploadForm.description);
      formData.append('packageName', uploadForm.packageName);
      formData.append('minSdkVersion', uploadForm.minSdkVersion);
      formData.append('targetSdkVersion', uploadForm.targetSdkVersion);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/apk/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (response.ok) {
        setShowUploadDialog(false);
        setUploadForm({
          name: '',
          version: '',
          description: '',
          packageName: '',
          minSdkVersion: '',
          targetSdkVersion: '',
          apkFile: null
        });
        fetchApks();
      } else {
        // no alerts requested
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Edit APK
  const handleEdit = (apk: APK) => {
    setEditingApk(apk);
    setEditForm({
      name: apk.name,
      version: apk.version,
      description: apk.description,
      packageName: apk.metadata?.packageName || '',
      minSdkVersion: apk.metadata?.minSdkVersion || '',
      targetSdkVersion: apk.metadata?.targetSdkVersion || ''
    });
    setShowEditDialog(true);
  };

  // Update APK
  const handleUpdate = async () => {
    if (!editingApk) return;

    try {
      setUploading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/apk/${editingApk._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ newFileName: editForm.name })
      });

      if (response.ok) {
        setShowEditDialog(false);
        setEditingApk(null);
        fetchApks();
      } else {
        // no alerts
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Delete APK
  const handleDelete = async (apkId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/apk/${apkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        fetchApks();
      } else {
        // no alerts
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Download APK
  const handleDownload = (apkId: string, fileName: string) => {
    window.open(`${import.meta.env.VITE_API_URL}/api/apk/${apkId}/download`, '_blank');
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">APK Management</h2>
          <p className="text-gray-400">Manage your application APK files</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="h-4 w-4 mr-2" />
              Upload APK
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Upload New APK</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Name *</Label>
                <Input
                  id="name"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                  placeholder="Enter APK name"
                />
              </div>
              <div>
                <Label htmlFor="version" className="text-white">Version *</Label>
                <Input
                  id="version"
                  value={uploadForm.version}
                  onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                  className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                  placeholder="Enter version (e.g., 1.0.0)"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Input
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <Label htmlFor="apkFile" className="text-white">APK File *</Label>
                <Input
                  id="apkFile"
                  type="file"
                  accept=".apk"
                  onChange={handleFileChange}
                  className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="packageName" className="text-white">Package Name</Label>
                  <Input
                    id="packageName"
                    value={uploadForm.packageName}
                    onChange={(e) => setUploadForm({ ...uploadForm, packageName: e.target.value })}
                    className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                    placeholder="com.example.app"
                  />
                </div>
                <div>
                  <Label htmlFor="minSdkVersion" className="text-white">Min SDK Version</Label>
                  <Input
                    id="minSdkVersion"
                    value={uploadForm.minSdkVersion}
                    onChange={(e) => setUploadForm({ ...uploadForm, minSdkVersion: e.target.value })}
                    className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                    placeholder="21"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
                className="text-white border-[#3A3A3A]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploading ? 'Uploading...' : 'Upload APK'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search APKs... (Press Enter to search)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 bg-[#2A2A2A] border-[#3A3A3A] text-white"
              />
            </div>


            <Button
              onClick={fetchApks}
              variant="outline"
              className="text-white border-[#3A3A3A]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* APKs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apks.map((apk) => (
          <Card key={apk._id} className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-white text-lg">{apk.name}</CardTitle>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Version: {apk.version}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {apk.description && (
                <p className="text-gray-300 text-sm">{apk.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <HardDrive className="h-4 w-4" />
                  <span>{formatFileSize(apk.fileSize)}</span>
                </div>
                {/* <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Download className="h-4 w-4" />
                  <span>{apk.downloadCount} downloads</span>
                </div> */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(apk.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <User className="h-4 w-4" />
                  <span>{apk.uploadedBy?.name || 'Admin'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(apk._id, apk.fileName)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEdit(apk)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => handleDelete(apk._id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit APK</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName" className="text-white">Name *</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
              />
            </div>
            <div>
              <Label htmlFor="editVersion" className="text-white">Version *</Label>
              <Input
                id="editVersion"
                value={editForm.version}
                onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
              />
            </div>
            <div>
              <Label htmlFor="editDescription" className="text-white">Description</Label>
              <Input
                id="editDescription"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
              />
            </div>
            
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="text-white border-[#3A3A3A]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uploading ? 'Updating...' : 'Update APK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {apks.length === 0 && (
        <div className="text-center py-10">
          <Smartphone className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">No APKs Found</h3>
          <p className="text-gray-400">Upload your first APK to get started</p>
        </div>
      )}
    </div>
  );
};

export default APKManagement;
