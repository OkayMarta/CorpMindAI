import React, { useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';

const UploadZone = ({ onFileSelect, isUploading }) => {
	const fileInputRef = useRef(null);

	const handleChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			onFileSelect(file);
		}
		// Скидаємо значення, щоб можна було завантажити той самий файл двічі, якщо треба
		e.target.value = '';
	};

	return (
		<div
			className={`border-2 border-dashed border-gray-700 rounded-xl p-8 text-center transition-all bg-dark2
            ${
				isUploading
					? 'opacity-75 cursor-not-allowed'
					: 'hover:border-blue hover:bg-gray-800/50 cursor-pointer'
			}`}
			onClick={() => !isUploading && fileInputRef.current.click()}
		>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				onChange={handleChange}
				accept=".pdf,.docx,.txt"
				disabled={isUploading}
			/>

			{isUploading ? (
				<div className="flex flex-col items-center text-blue animate-pulse">
					<Loader2 className="animate-spin mb-3 w-8 h-8" />
					<p className="font-medium text-sm">
						Processing & Indexing...
					</p>
					<p className="text-xs text-gray-500 mt-1">
						This allows AI to read your file
					</p>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center gap-2">
					<div className="bg-gray-800 p-3 rounded-full text-gray-400 mb-1">
						<Upload size={24} />
					</div>
					<p className="text-light font-medium">
						Click to upload documents
					</p>
					<p className="text-xs text-gray-500">
						PDF, DOCX, TXT (Max 10MB)
					</p>
				</div>
			)}
		</div>
	);
};

export default UploadZone;
