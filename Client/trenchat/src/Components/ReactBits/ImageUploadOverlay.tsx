import React from 'react';
import { CloudUploadOutlined } from '@ant-design/icons';
import { theme } from 'antd';

interface Props {
    visible: boolean;
}

const ImageUploadOverlay: React.FC<Props> = ({ visible }) => {
    const { token } = theme.useToken();
    if (!visible) return null;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ color: 'white', textAlign: 'center', border: `2px dashed ${token.colorWhite}`, padding: '40px', borderRadius: token.borderRadiusLG }}>
                <CloudUploadOutlined style={{ fontSize: '48px' }} />
                <p style={{ marginTop: token.margin, fontSize: token.fontSizeLG }}>Solte a imagem aqui para enviar</p>
            </div>
        </div>
    );
};

export default ImageUploadOverlay;