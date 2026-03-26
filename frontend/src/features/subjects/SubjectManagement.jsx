import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaExclamationCircle, FaList } from 'react-icons/fa';
import useSubjectStore from '../../store/subjectStore';
import useAuthStore from '../../store/authStore';

const SubjectManagement = () => {
    const { subjects, isLoading, error, fetchSubjects, createSubject, updateSubject, deleteSubject } = useSubjectStore();
    const { user } = useAuthStore();
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [currentSubject, setCurrentSubject] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', parentSubjectId: '' });
    const [deleteAction, setDeleteAction] = useState('reassign_questions');
    const [fallbackSubjectId, setFallbackSubjectId] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await createSubject(formData);
            setIsAddModalOpen(false);
            setFormData({ name: '', description: '', parentSubjectId: '' });
        } catch (err) { }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateSubject(currentSubject._id, formData);
            setIsEditModalOpen(false);
        } catch (err) { }
    };

    const handleDeleteSubmit = async (e) => {
        e.preventDefault();
        try {
            await deleteSubject(currentSubject._id, { action: deleteAction, fallbackSubjectId: fallbackSubjectId || undefined });
            setIsDeleteModalOpen(false);
        } catch (err) { }
    };

    const openEditModal = (subject) => {
        setCurrentSubject(subject);
        setFormData({
            name: subject.name,
            description: subject.description || '',
            parentSubjectId: subject.parentSubjectId?._id || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (subject) => {
        setCurrentSubject(subject);
        setDeleteAction('reassign_questions');
        setFallbackSubjectId('');
        setIsDeleteModalOpen(true);
    };

    if (user?.role !== 'Admin' && user?.role !== 'Instructor') {
        return <div className="p-8 text-center text-red-500">Unauthorized</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Subjects Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Organize your questions into structured subjects.</p>
                </div>
                <button
                    onClick={() => { setFormData({ name: '', description: '', parentSubjectId: '' }); setIsAddModalOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
                >
                    <FaPlus /> Create Subject
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                    <FaExclamationCircle /> <p>{error}</p>
                </div>
            )}

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subjects.map((subject) => (
                            <tr key={subject._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{subject.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {subject.parentSubjectId ? subject.parentSubjectId.name : <span className="text-gray-400 italic">None</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-bold">{subject.questionCount}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/questions?subject=${subject._id}`} className="text-gray-500 hover:text-gray-900 mx-2 inline-flex items-center gap-1" title="View Questions">
                                        <FaList /> View
                                    </Link>
                                    <button onClick={() => openEditModal(subject)} className="text-blue-600 hover:text-blue-900 mx-2" title="Edit"><FaEdit /></button>
                                    <button onClick={() => openDeleteModal(subject)} className="text-red-600 hover:text-red-900" title="Delete"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subjects.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-gray-500">No subjects found. Create one to get started!</div>
                )}
            </div>

            {/* Modals */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Create New Subject</h3>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" rows="3"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Subject (Optional)</label>
                                <select value={formData.parentSubjectId} onChange={(e) => setFormData({...formData, parentSubjectId: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                                    <option value="">-- None (Top Level) --</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Edit Subject</h3>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" rows="3"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Subject (Optional)</label>
                                <select value={formData.parentSubjectId} onChange={(e) => setFormData({...formData, parentSubjectId: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                                    <option value="">-- None (Top Level) --</option>
                                    {subjects.filter(s => s._id !== currentSubject?._id).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-red-200 bg-red-50">
                            <h3 className="text-lg font-bold text-red-900 flex items-center gap-2"><FaExclamationCircle /> Delete Subject</h3>
                        </div>
                        <form onSubmit={handleDeleteSubmit} className="p-6 space-y-4">
                            <p className="text-sm text-gray-700">You are about to delete the subject <strong>{currentSubject?.name}</strong>. It currently contains {currentSubject?.questionCount} questions.</p>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">What should happen to the associated questions?</label>
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="radio" name="deleteAction" value="reassign_questions" checked={deleteAction === 'reassign_questions'} onChange={(e) => setDeleteAction(e.target.value)} className="mt-1" />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">Reassign</span>
                                            <span className="block text-xs text-gray-500">Move all questions to another subject or default to Uncategorized.</span>
                                        </div>
                                    </label>
                                    
                                    {deleteAction === 'reassign_questions' && (
                                        <div className="pl-8 -mt-1 mb-2">
                                            <select value={fallbackSubjectId} onChange={(e) => setFallbackSubjectId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg sm:text-sm bg-white">
                                                <option value="">-- Let system assign to "Uncategorized" --</option>
                                                {subjects.filter(s => s._id !== currentSubject?._id).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="radio" name="deleteAction" value="archive_questions" checked={deleteAction === 'archive_questions'} onChange={(e) => setDeleteAction(e.target.value)} className="mt-1" />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">Archive Questions</span>
                                            <span className="block text-xs text-gray-500">Keep questions but change their status to Archived.</span>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                                        <input type="radio" name="deleteAction" value="delete_questions" checked={deleteAction === 'delete_questions'} onChange={(e) => setDeleteAction(e.target.value)} className="mt-1" />
                                        <div>
                                            <span className="block text-sm font-medium text-red-900">Delete Questions</span>
                                            <span className="block text-xs text-red-700">Permanently delete all associated questions.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">Delete Permanently</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;
