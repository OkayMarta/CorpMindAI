import React from 'react';
import { X, Check, XCircle, Bell } from 'lucide-react';

const NotificationsModal = ({ isOpen, onClose, invitations, onRespond }) => {
	if (!isOpen) return null;

	const getInitials = (name) => {
		return name ? name.substring(0, 2).toUpperCase() : 'UR';
	};

	const formatDate = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return '';
		return date.toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			{/* Modal Container */}
			<div className="bg-dark2 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl transform transition-all flex flex-col max-h-[85vh]">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-700 flex-shrink-0">
					<div className="flex items-center gap-3">
						<h2 className="text-xl font-bold text-light">
							Notifications
						</h2>
						{invitations.length > 0 && (
							<span className="bg-gradient-btn text-light text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
								{invitations.length}
							</span>
						)}
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-light transition-colors p-1 hover:bg-gray-800 rounded-full"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto custom-scrollbar">
					{invitations.length === 0 ? (
						<div className="text-center py-8">
							<div className="bg-dark border border-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
								<Bell className="w-8 h-8 opacity-50" />
							</div>
							<p className="text-gray-300 font-medium">
								No pending invitations
							</p>
							<p className="text-gray-500 text-sm mt-1">
								You're all caught up!
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{invitations.map((invite) => (
								<div
									key={invite.id}
									className="bg-dark border border-gray-700 rounded-lg p-4 hover:border-blue/50 transition-colors shadow-sm"
								>
									{/* User Info Row */}
									<div className="flex items-start gap-4 mb-4">
										{/* Avatar */}
										<div className="flex-shrink-0">
											{invite.sender_avatar ? (
												<img
													src={invite.sender_avatar}
													alt={invite.sender_nickname}
													className="w-12 h-12 rounded-full object-cover border-2 border-dark2"
												/>
											) : (
												<div className="w-12 h-12 rounded-full bg-gradient-btn flex items-center justify-center text-light font-bold text-sm shadow-md border-2 border-dark2">
													{getInitials(
														invite.sender_nickname
													)}
												</div>
											)}
										</div>

										{/* Text */}
										<div className="flex-1 min-w-0 pt-0.5">
											<p className="text-sm text-gray-300 leading-snug">
												<span className="font-semibold text-light">
													{invite.sender_nickname}
												</span>{' '}
												invited you to join:
											</p>
											<p className="font-bold text-light text-lg truncate mt-1">
												{invite.workspace_title}
											</p>
											<p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
												Received:{' '}
												{formatDate(invite.created_at)}
											</p>
										</div>
									</div>

									{/* Buttons Row */}
									<div className="flex gap-3">
										<button
											onClick={() =>
												onRespond(
													invite.token,
													'accept'
												)
											}
											className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-light py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-900/20"
										>
											<Check className="w-4 h-4" /> Accept
										</button>
										<button
											onClick={() =>
												onRespond(
													invite.token,
													'decline'
												)
											}
											className="flex-1 bg-transparent border border-gray-600 text-gray-400 hover:text-uiError hover:border-uiError hover:bg-uiError/5 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
										>
											<XCircle className="w-4 h-4" />{' '}
											Decline
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default NotificationsModal;
