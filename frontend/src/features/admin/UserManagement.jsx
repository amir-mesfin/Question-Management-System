import React, { useState, useEffect, useCallback } from 'react';
import { FaUserPlus, FaTrash, FaUserShield, FaUserGraduate, FaChalkboardTeacher, FaExclamationCircle, FaSearch } from 'react-icons/fa';
import api from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student'
    });

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/api/users');
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/users', formData);
            setFormData({ name: '', email: '', password: '', role: 'Student' });
            fetchUsers();
            alert('User created successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/api/users/${id}`);
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Admin': return <FaUserShield className="text-purple-600" />;
            case 'Instructor': return <FaChalkboardTeacher className="text-blue-600" />;
            default: return <FaUserGraduate className="text-green-600" />;
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500 mt-1">Manage platform roles and accounts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FaUserPlus className="text-blue-600" />
                            Create User
                        </h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Role</label>
                                <select
                                    name="role"
                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Instructor">Instructor</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-800 transition transform active:scale-95 mt-2"
                            >
                                Create User
                            </button>
                        </form>
                    </div>
                </div>

                {/* Users List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <FaSearch className="text-gray-400 ml-2" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm italic border border-red-100">
                            <FaExclamationCircle /> {error}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-50">
                            {isLoading ? (
                                <div className="p-12 text-center text-gray-400 text-sm font-medium">Loading users...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 text-sm font-medium">No users found.</div>
                            ) : filteredUsers.map(user => (
                                <li key={user._id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                            {getRoleIcon(user.role)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-400 font-medium truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                user.role === 'Instructor' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                            {user.role}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg"
                                            title="Delete User"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
