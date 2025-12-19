import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Upload, Trash2, Search, Edit3, X, Check, Download, Eye } from 'lucide-react';

interface InvoiceFile {
    id: string;
    name: string;
    created_at: string;
    metadata: Record<string, any> | null;
}

export default function Invoices() {
    const [files, setFiles] = useState<InvoiceFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const BUCKET_NAME = 'notas_fiscais_bons_frutos';

    // Função para sanitizar nome do arquivo (remove caracteres especiais e espaços)
    const sanitizeFileName = (name: string): string => {
        return name
            .normalize('NFD') // Normaliza caracteres acentuados
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais por _
            .replace(/_+/g, '_') // Remove múltiplos underscores consecutivos
            .replace(/^_|_$/g, ''); // Remove underscores no início/fim
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
        });

        if (error) {
            console.error('Error fetching files:', error);
        } else {
            setFiles(data as InvoiceFile[] || []);
        }
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        // Sanitize filename and generate unique name
        const timestamp = Date.now();
        const sanitizedName = sanitizeFileName(file.name);
        const fileName = `${timestamp}_${sanitizedName}`;

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file);

        if (error) {
            alert(`Erro ao fazer upload: ${error.message}`);
            console.error('Upload error:', error);
        } else {
            fetchFiles();
        }

        setUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

        const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileName]);

        if (error) {
            alert(`Erro ao excluir: ${error.message}`);
            console.error('Delete error:', error);
        } else {
            fetchFiles();
        }
    };

    const handleRename = async (oldName: string) => {
        if (!editName.trim()) {
            setEditingId(null);
            return;
        }

        // Get file extension
        const extension = oldName.split('.').pop();
        const timestamp = Date.now();
        const sanitizedName = sanitizeFileName(editName.includes('.') ? editName : `${editName}.${extension}`);
        const newName = `${timestamp}_${sanitizedName}`;

        // Download the file first
        const { data: fileData, error: downloadError } = await supabase.storage
            .from(BUCKET_NAME)
            .download(oldName);

        if (downloadError) {
            alert(`Erro ao renomear: ${downloadError.message}`);
            return;
        }

        // Upload with new name
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(newName, fileData);

        if (uploadError) {
            alert(`Erro ao renomear: ${uploadError.message}`);
            return;
        }

        // Delete old file
        await supabase.storage.from(BUCKET_NAME).remove([oldName]);

        setEditingId(null);
        setEditName('');
        fetchFiles();
    };

    const startEditing = (file: InvoiceFile) => {
        setEditingId(file.name);
        // Remove timestamp prefix for display
        const displayName = file.name.replace(/^\d+_/, '');
        setEditName(displayName.replace(/\.[^/.]+$/, ''));
    };

    const getPublicUrl = (fileName: string) => {
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        return data.publicUrl;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDisplayName = (fileName: string) => {
        // Remove timestamp prefix
        return fileName.replace(/^\d+_/, '');
    };

    const filteredFiles = files.filter(file =>
        getDisplayName(file.name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Notas Fiscais</h1>
                    <p className="text-gray-400 mt-1">Gerencie as notas fiscais da empresa</p>
                </div>

                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50"
                    >
                        <Upload size={20} />
                        {uploading ? 'Enviando...' : 'Upload'}
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar notas fiscais..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-bg border border-brand-700/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none transition-all"
                    />
                </div>
            </div>

            {/* Files Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-400">Carregando...</div>
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">
                        {searchTerm ? 'Nenhum arquivo encontrado' : 'Nenhuma nota fiscal cadastrada'}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Clique em "Upload" para adicionar arquivos
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFiles.map((file) => (
                        <div
                            key={file.name}
                            className="glass-panel rounded-xl p-4 hover:border-brand-500/30 transition-all group"
                        >
                            {/* File Icon/Preview */}
                            <div className="aspect-video bg-dark-bg rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                                {file.metadata?.mimetype?.startsWith('image/') ? (
                                    <img
                                        src={getPublicUrl(file.name)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FileText size={48} className="text-brand-400" />
                                )}
                            </div>

                            {/* File Name */}
                            <div className="mb-3">
                                {editingId === file.name ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="flex-1 bg-dark-bg border border-brand-500 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename(file.name);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                        />
                                        <button
                                            onClick={() => handleRename(file.name)}
                                            className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-white font-medium truncate" title={getDisplayName(file.name)}>
                                        {getDisplayName(file.name)}
                                    </p>
                                )}
                            </div>

                            {/* File Info */}
                            <div className="text-xs text-gray-500 mb-4">
                                <p>{formatDate(file.created_at)}</p>
                                {file.metadata?.size && <p>{formatFileSize(file.metadata.size)}</p>}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={getPublicUrl(file.name)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-600/20 text-brand-400 rounded-lg hover:bg-brand-600/30 transition-all text-sm"
                                >
                                    <Eye size={14} />
                                    Ver
                                </a>
                                <a
                                    href={getPublicUrl(file.name)}
                                    download={getDisplayName(file.name)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <Download size={16} />
                                </a>
                                <button
                                    onClick={() => startEditing(file)}
                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(file.name)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
