import React from 'react';
import { X, Check, XCircle, Bell } from 'lucide-react';

// UI Components
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';

const NotificationsModal = ({ isOpen, onClose, invitations, onRespond }) => {
	if (!isOpen) return null;

	const formatDate = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
						className="text-gray-400 hover:text-light transition-colors"
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
									className="bg-dark border border-gray-700 rounded-lg p-4 shadow-sm"
								>
									{/* Info Row */}
									<div className="flex items-start gap-4 mb-4">
										{/* Avatar */}
										<Avatar
											url={invite.sender_avatar}
											name={invite.sender_nickname}
											size="w-12 h-12"
										/>

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
											<p className="text-xs text-gray-500 mt-1">
												Received:{' '}
												{formatDate(invite.created_at)}
											</p>
										</div>
									</div>

									{/* Buttons Row */}
									<div className="flex gap-3">
										<Button
											onClick={() =>
												onRespond(
													invite.token,
													'accept'
												)
											}
											className="flex-1 bg-green-600 hover:bg-green-700 border-none shadow-none" // Перевизначаємо колір на зелений
										>
											<Check className="w-4 h-4" /> Accept
										</Button>

										<Button
											variant="secondary"
											onClick={() =>
												onRespond(
													invite.token,
													'decline'
												)
											}
											className="flex-1"
										>
											<XCircle className="w-4 h-4" />{' '}
											Decline
										</Button>
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
