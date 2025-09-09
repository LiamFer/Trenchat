package com.liamfer.Trenchat.repository;

import com.liamfer.Trenchat.entity.MessageEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface MessageRepository extends JpaRepository<MessageEntity,Long> {
    Page<MessageEntity> findAllByChatId(String id, Pageable pageable);
}
