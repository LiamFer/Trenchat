package com.liamfer.Trenchat.repository;

import com.liamfer.Trenchat.entity.ChatEntity;
import com.liamfer.Trenchat.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatEntity,String> {
    List<ChatEntity> findAllByParticipantsId(String userId);

    @Query("""
    SELECT c AS chat,
           COUNT(m) FILTER (WHERE :user NOT MEMBER OF m.seenBy) AS unreadCount,
           MAX(m.createdAt) AS lastMessageTime
    FROM ChatEntity c
    LEFT JOIN c.messages m
    JOIN c.participants p
    WHERE p.id = :userId
    GROUP BY c
    ORDER BY lastMessageTime DESC
    """)
    List<Object[]> findChatsWithUnreadCountAndLastMessageTime(@Param("userId") String userId, @Param("user") UserEntity user);

}
