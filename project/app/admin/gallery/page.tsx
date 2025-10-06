'use client'

import { Camera } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminGalleryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600 mt-1">Manage your travel photos and media</p>
        </div>
        <Link href="/gallery">
          <Button variant="outline">View Public Gallery</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Gallery Management Coming Soon
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Upload, organize, and manage your travel photos and videos.
          Create albums, add descriptions, and showcase your best moments.
        </p>
      </div>
    </div>
  )
}
