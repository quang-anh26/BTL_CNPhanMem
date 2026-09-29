package com.example.messaging.service;

import com.example.messaging.dto.feed.CreateCommentRequest;
import com.example.messaging.dto.feed.CreatePostRequest;
import com.example.messaging.dto.feed.FeedCommentResponse;
import com.example.messaging.dto.feed.FeedPostResponse;
import com.example.messaging.entity.SocialPost;
import com.example.messaging.entity.SocialPostComment;
import com.example.messaging.entity.SocialPostReaction;
import com.example.messaging.entity.User;
import com.example.messaging.exception.ApiException;
import com.example.messaging.repository.SocialPostCommentRepository;
import com.example.messaging.repository.SocialPostReactionRepository;
import com.example.messaging.repository.SocialPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {

    private static final Set<String> VIDEO_EXTENSIONS = Set.of(
            "mp4", "webm", "ogg", "mov", "m4v", "avi", "mkv", "mpeg", "mpg", "3gp");
    private static final Set<String> REACTION_TYPES = Set.of("LIKE", "LOVE", "HAHA", "WOW", "ANGRY");

    private final SocialPostRepository postRepository;
    private final SocialPostReactionRepository reactionRepository;
    private final SocialPostCommentRepository commentRepository;
    private final UserService userService;

    public List<FeedPostResponse> list(Long viewerId) {
        return postRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(
                        SocialPost::getCreatedAt,
                        java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())))
                .map(post -> toResponse(post, viewerId))
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedPostResponse create(Long authorId, CreatePostRequest request) {
        String content = request.getContent() == null ? null : request.getContent().trim();
        String imageUrl = request.getImageUrl() == null ? null : request.getImageUrl().trim();
        String mediaType = request.getMediaType() == null ? null : request.getMediaType().trim().toUpperCase();
        boolean hasContent = content != null && !content.isBlank();
        boolean hasMedia = imageUrl != null && !imageUrl.isBlank();

        if (!hasContent && !hasMedia) {
            throw ApiException.badRequest("Bài viết cần có nội dung hoặc ảnh/video");
        }
        if (hasMedia && mediaType != null && !"IMAGE".equals(mediaType) && !"VIDEO".equals(mediaType)) {
            throw ApiException.badRequest("Loại media không hợp lệ");
        }
        if (!hasMedia && mediaType != null) {
            throw ApiException.badRequest("Thiếu ảnh hoặc video cho bài viết");
        }

        User author = userService.getByIdOrThrow(authorId);
        SocialPost post = postRepository.save(SocialPost.builder()
                .author(author)
                .content(hasContent ? content : "")
                .imageUrl(hasMedia ? imageUrl : null)
                .build());
        return toResponse(post, authorId);
    }

    @Transactional
    public FeedPostResponse toggleLike(Long postId, Long userId) {
        return setReaction(postId, userId, "LIKE");
    }

    @Transactional
    public FeedPostResponse setReaction(Long postId, Long userId, String reactionType) {
        SocialPost post = getPost(postId);
        User user = userService.getByIdOrThrow(userId);
        String normalizedType = reactionType == null ? "LIKE" : reactionType.trim().toUpperCase(Locale.ROOT);
        if (!REACTION_TYPES.contains(normalizedType)) {
            throw ApiException.badRequest("Loại cảm xúc không hợp lệ");
        }

        reactionRepository.findByPostPostIdAndUserUserId(postId, userId).ifPresentOrElse(reaction -> {
            String currentType = reaction.getReactionType() == null ? "LIKE" : reaction.getReactionType();
            if (currentType.equals(normalizedType)) {
                reactionRepository.delete(reaction);
            } else {
                reaction.setReactionType(normalizedType);
                reactionRepository.save(reaction);
            }
        }, () -> reactionRepository.save(SocialPostReaction.builder()
                .post(post)
                .user(user)
                .reactionType(normalizedType)
                .build()));
        return toResponse(post, userId);
    }

    @Transactional
    public FeedPostResponse addComment(Long postId, Long authorId, CreateCommentRequest request) {
        SocialPost post = getPost(postId);
        User author = userService.getByIdOrThrow(authorId);
        commentRepository.save(SocialPostComment.builder()
                .post(post)
                .author(author)
                .content(request.getContent().trim())
                .build());
        return toResponse(post, authorId);
    }

    @Transactional
    public void delete(Long postId, Long requesterId) {
        SocialPost post = getPost(postId);
        if (!post.getAuthor().getUserId().equals(requesterId)) {
            throw ApiException.forbidden("Chỉ tác giả mới có thể xóa bài viết");
        }
        postRepository.delete(post);
    }

    private SocialPost getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài viết"));
    }

    private FeedPostResponse toResponse(SocialPost post, Long viewerId) {
        SocialPostReaction viewerReaction = reactionRepository
            .findByPostPostIdAndUserUserId(post.getPostId(), viewerId).orElse(null);
        List<FeedCommentResponse> comments = commentRepository.findByPostPostIdOrderByCreatedAtAsc(post.getPostId())
                .stream().map(comment -> FeedCommentResponse.builder()
                        .commentId(comment.getCommentId())
                        .authorId(comment.getAuthor().getUserId())
                        .authorName(displayName(comment.getAuthor()))
                        .authorAvatar(comment.getAuthor().getAvatar())
                        .content(comment.getContent())
                        .createdAt(comment.getCreatedAt())
                        .build()).collect(Collectors.toList());

        return FeedPostResponse.builder()
                .postId(post.getPostId())
                .authorId(post.getAuthor().getUserId())
                .authorName(displayName(post.getAuthor()))
                .authorAvatar(post.getAuthor().getAvatar())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .mediaType(resolveMediaType(post.getImageUrl()))
                .createdAt(post.getCreatedAt())
                .likeCount(reactionRepository.countByPostPostId(post.getPostId()))
                .likedByViewer(viewerReaction != null)
                .viewerReaction(viewerReaction == null ? null :
                    (viewerReaction.getReactionType() == null ? "LIKE" : viewerReaction.getReactionType()))
                .comments(comments)
                .build();
    }

    private String resolveMediaType(String mediaUrl) {
        if (mediaUrl == null || mediaUrl.isBlank()) return null;
        String path = mediaUrl.toLowerCase(Locale.ROOT).split("\\?", 2)[0];
        int extensionStart = path.lastIndexOf('.');
        if (extensionStart < 0) return "IMAGE";
        String extension = path.substring(extensionStart + 1);
        return VIDEO_EXTENSIONS.contains(extension) ? "VIDEO" : "IMAGE";
    }

    private String displayName(User user) {
        return user.getDisplayName() == null || user.getDisplayName().isBlank()
                ? user.getUsername() : user.getDisplayName();
    }
}