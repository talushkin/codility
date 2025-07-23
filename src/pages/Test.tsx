import React, { useState } from 'react';
import cx from 'classnames';

interface LikeButtonProps {
  initialLikesCount?: number;
}

export default function LikeButton({ initialLikesCount = 100 }: LikeButtonProps) {
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);

  const handleClick = () => {
    if (liked) {
      // Undo like
      setLiked(false);
      setLikesCount(likesCount - 1);
    } else {
      // Add like
      setLiked(true);
      setLikesCount(likesCount + 1);
    }
  };

  return (
    <>
      <div 
        className={cx('like-button', { 'liked': liked })}
        onClick={handleClick}
      >
        Like | <span className="likes-counter">{likesCount}</span>
      </div>
      <style>{`
        .like-button {
          font-size: 1rem;
          padding: 5px 10px;
          color: #585858;
          cursor: pointer;
        }
        .liked {
          font-weight: bold;
          color: #1565c0;
        }
      `}</style>
    </>
  );
}
