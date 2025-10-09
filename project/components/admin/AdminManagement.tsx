'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { 
  Users, 
  User,
  Shield, 
  ShieldOff,
  Loader2,
  Save,
  Search
} from 'lucide-react'
import { UsersAdminService } from '@/lib/users-admin'

interface AdminUser {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  is_active?: boolean
  created_at: string
  updated_at: string
}

export default function AdminManagement() {
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadUsers()
    loadCurrentUser()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await UsersAdminService.getUsers()
      setAllUsers(usersData.items || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentUser = () => {
    const userData = localStorage.getItem('admin_user')
    if (userData) {
      const user = JSON.parse(userData)
      setProfileForm({
        full_name: user.full_name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    try {
      setSaving(true)
      await UsersAdminService.promoteToAdmin(userId)
      await loadUsers()
      
      toast({
        title: 'Success',
        description: `${userName} has been promoted to admin`,
      })
    } catch (error) {
      console.error('Error promoting user:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to promote user to admin',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRevokeAdmin = async (userId: string, userName: string) => {
    try {
      setSaving(true)
      await UsersAdminService.revokeAdminStatus(userId)
      await loadUsers()
      
      toast({
        title: 'Success',
        description: `Admin status revoked from ${userName}`,
      })
    } catch (error) {
      console.error('Error revoking admin status:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to revoke admin status',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setSaving(true)
      if (isActive) {
        await UsersAdminService.deactivateUser(userId)
      } else {
        await UsersAdminService.activateUser(userId)
      }
      await loadUsers()
      
      toast({
        title: 'Success',
        description: `User ${isActive ? 'deactivated' : 'activated'} successfully`,
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters long',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = allUsers.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-gray-500">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your Profile</h3>
          <p className="text-sm text-gray-600">Update your personal information and password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile_name">Full Name</Label>
                  <Input
                    id="profile_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile_email">Email Address</Label>
                  <Input
                    id="profile_email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Change Password</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_new_password">Confirm New Password</Label>
                    <Input
                      id="confirm_new_password"
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* User Management Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
          <p className="text-sm text-gray-600">Promote users to admin or manage user permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>
              Promote existing users to admin or revoke admin privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={user.is_admin ? "default" : "secondary"}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </Badge>
                          <Badge variant={user.is_active ? "outline" : "destructive"}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!user.is_admin ? (
                        <Button
                          size="sm"
                          onClick={() => handlePromoteToAdmin(user.id, user.full_name)}
                          disabled={saving || !user.is_active}
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Promote to Admin
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeAdmin(user.id, user.full_name)}
                          disabled={saving}
                        >
                          <ShieldOff className="h-4 w-4 mr-1" />
                          Revoke Admin
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleUserStatus(user.id, user.is_active ?? false)}
                        disabled={saving}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No users found matching your search' : 'No users found'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
