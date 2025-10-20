import React, { useState } from 'react';
import { Avatar, Image } from 'antd';
import type { AvatarProps } from 'antd';

interface ClickableAvatarProps extends AvatarProps {
    src?: string;
}

const ClickableAvatar: React.FC<ClickableAvatarProps> = ({ src, ...rest }) => {
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const handleAvatarClick = () => {
        if (src) {
            setIsPreviewVisible(true);
        }
    };

    return (
        <>
            <Avatar src={src} {...rest} onClick={handleAvatarClick} style={{ cursor: src ? 'pointer' : 'default', ...rest.style }} />
            <Image
                width={0}
                height={0}
                style={{ display: 'none' }}
                src={src}
                preview={{ visible: isPreviewVisible, onVisibleChange: (vis) => setIsPreviewVisible(vis), src: src }}
            />
        </>
    );
};

export default ClickableAvatar;