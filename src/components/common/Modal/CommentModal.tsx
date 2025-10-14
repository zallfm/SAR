import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from '../../icons/CloseIcon';
import type { Comment } from '../../../../data';

interface CommentModalProps {
  onClose: () => void;
  onSubmit: (comment: string) => void;
  targetUser: string;
  commentingUser: string;
  comments: Comment[];
}

const CommentModal: React.FC<CommentModalProps> = ({ onClose, onSubmit, targetUser, commentingUser, comments = [] }) => {
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onSubmit(newComment.trim());
      setNewComment('');
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Comment History for {targetUser}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {/* Comment History */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-800">{comment.user}</span>
                  <span className="text-xs text-gray-400">{formatTimestamp(comment.timestamp)}</span>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none text-sm text-gray-700 w-fit max-w-full">
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No comments yet.</p>
          )}
          <div ref={commentsEndRef} />
        </div>
        
        {/* New Comment Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-t">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Add a new comment as {commentingUser}
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your comment..."
            />
          </div>
          <div className="flex justify-end items-center mt-3 gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;