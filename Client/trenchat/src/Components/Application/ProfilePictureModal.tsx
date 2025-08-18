import React, { useState } from 'react';
import { Upload, Modal } from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import ImgCrop from 'antd-img-crop';
import { uploadPicture } from '../../Service/server.service';
import { updateUserPicture } from '../../Redux/userSlice';
import { useDispatch } from 'react-redux';

interface Props {
    open: boolean;
    onClose: () => void;
}

const ProfilePictureModal: React.FC<Props> = ({ open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [croppedFile, setCroppedFile] = useState<File | null>(null);
    const dispatch = useDispatch();

    const handleChange: UploadProps['onChange'] = ({ fileList: newList }) => {
        setFileList(newList);
    };

    const handleOk = async () => {
        if (!croppedFile) return;
        setLoading(true);
        const response = await uploadPicture(croppedFile);
        if (response?.success) {
            dispatch(updateUserPicture(response.data.url));
        }
        setLoading(false);
        onClose();
    };

    return (
        <Modal
            title="Alterar Foto de Perfil"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText="Salvar"
            confirmLoading={loading}
            cancelText="Cancelar"
        >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ImgCrop rotate aspect={1}>
                    <Upload
                        accept="image/*"
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleChange}
                        beforeUpload={async (file: File) => {
                            // Aqui usamos a API interna do ImgCrop para pegar o crop
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = async () => {
                                const img = document.createElement('img');
                                img.src = reader.result as string;
                                img.onload = async () => {
                                    const canvas = document.createElement('canvas');
                                    const size = Math.min(img.width, img.height);
                                    canvas.width = size;
                                    canvas.height = size;
                                    const ctx = canvas.getContext('2d')!;
                                    ctx.drawImage(
                                        img,
                                        0, 0, size, size,
                                        0, 0, size, size
                                    );
                                    canvas.toBlob((blob) => {
                                        if (blob) {
                                            const cropped = new File([blob], file.name, { type: blob.type });
                                            setCroppedFile(cropped);
                                        }
                                    }, file.type);
                                };
                            };
                            return false; // cancela upload automático
                        }}
                    >
                        {fileList.length < 1 && <div>+ Upload</div>}
                    </Upload>
                </ImgCrop>
            </div>
        </Modal>
    );
};

export default ProfilePictureModal;
