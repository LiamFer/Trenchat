package com.liamfer.Trenchat.service;

import com.cloudinary.Cloudinary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String addImage(MultipartFile file,String id){
        Map<String, Object> options = new HashMap<>();
        options.put("folder", "Trenchat");
        options.put("public_id", id);
        try {
            Map uploadResult = cloudinary.uploader().uploadLarge(file.getInputStream(), options);
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Erro ao fazer upload para o Cloudinary", e);
        }
    }

    public String deleteImage(String publicId) {
        Map<String, Object> options = new HashMap<>();
        options.put("invalidate", true);
        try {
            Map result = cloudinary.uploader().destroy(publicId, options);
            return (String) result.get("result");
        } catch (IOException e) {
            throw new RuntimeException("Erro ao deletar imagem do Cloudinary", e);
        }
    }
}
