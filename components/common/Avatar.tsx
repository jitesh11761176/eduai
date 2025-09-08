import React from 'react';
import { resolveAvatarUrl } from '../../utils/avatarUtils';

type AvatarProps = {
	name: string;
	src?: string;
	size?: number; // in pixels
	className?: string;
	rounded?: 'full' | 'md';
	alt?: string;
};

const Avatar: React.FC<AvatarProps> = ({ name, src, size = 40, className = '', rounded = 'full', alt }) => {
	const url = resolveAvatarUrl(name, src);
	const radius = rounded === 'full' ? 'rounded-full' : 'rounded-md';
	return (
		<img
			src={url}
			alt={alt || `${name} avatar`}
			style={{ width: size, height: size }}
			className={`${radius} ${className}`}
		/>
	);
};

export default Avatar;
