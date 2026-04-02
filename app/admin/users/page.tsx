'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Users, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = () => axios.get('/api/admin/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false))
  useEffect(() => { fetchUsers() }, [])

  const approveUser = async (userId: string, approved: boolean) => {
    setUpdating(userId)
    try {
      await axios.put('/api/admin/users', { userId, approved })
      toast.success(approved ? 'User approved!' : 'User rejected')
      fetchUsers()
    } catch {
      toast.error('Failed to update user')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const pendingUsers = users.filter(u => !u.approved && (u.role === 'vendor' || u.role === 'agent'))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>
        {pendingUsers.length > 0 && (
          <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium">
            {pendingUsers.length} pending approval
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 w-64"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'customer', 'vendor', 'agent', 'admin'].map(role => (
            <button key={role} onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${roleFilter === role ? 'bg-green-600 text-white' : 'bg-white border border-green-200 text-gray-600 hover:bg-green-50'}`}>
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b border-green-100">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-green-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'agent' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.role === 'customer' || user.role === 'admin' ? (
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      ) : (
                        <span className={`text-xs font-medium ${user.approved ? 'text-green-600' : 'text-amber-600'}`}>
                          {user.approved ? '✓ Approved' : '⏳ Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      {(user.role === 'vendor' || user.role === 'agent') && (
                        <div className="flex gap-2">
                          {!user.approved ? (
                            <button
                              onClick={() => approveUser(user._id, true)}
                              disabled={updating === user._id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-60"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => approveUser(user._id, false)}
                              disabled={updating === user._id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-60"
                            >
                              <XCircle className="w-3 h-3" />
                              Revoke
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                No users found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
