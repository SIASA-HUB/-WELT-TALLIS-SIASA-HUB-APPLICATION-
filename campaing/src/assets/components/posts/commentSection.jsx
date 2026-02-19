import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Send,
  CornerDownRight
} from 'lucide-react';

// --- Theme ---
const THEME = {
  primary: '#BB0000', // Kenya Red
  bg: '#ffffff',
  secondaryBg: '#f0f2f5',
  textMain: '#050505',
  textSecondary: '#65676b',
  border: '#e4e6eb'
};

// --- Styled Components ---
const Section = styled.section`
  max-width: 600px;
  margin: 2rem auto;
  background: ${THEME.bg};
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.1);
  padding: 16px;
  font-family: -apple-system, system-ui, sans-serif;
`;

const CommentGroup = styled.div`
  margin-bottom: 20px;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 4px;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #ddd;
`;

const ContentCard = styled.div`
  background: ${THEME.secondaryBg};
  padding: 8px 12px;
  border-radius: 18px;
  max-width: calc(100% - 46px);
`;

const AuthorName = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: ${THEME.textMain};
`;

const Text = styled.p`
  font-size: 14px;
  margin: 2px 0 0 0;
  line-height: 1.4;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 16px;
  margin-left: 50px;
  font-size: 12px;
  font-weight: 700;
  color: ${THEME.textSecondary};
  align-items: center;
`;

const ActionBtn = styled.button`
  background: none;
  border: none;
  font-weight: 700;
  font-size: 12px;
  color: ${props => props.active ? THEME.primary : THEME.textSecondary};
  cursor: pointer;
  padding: 4px 0;
  &:hover { text-decoration: underline; }
`;

const ReplySection = styled.div`
  margin-left: 50px;
  margin-top: 8px;
  border-left: 2px solid ${THEME.border};
  padding-left: 12px;
`;

const InputBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${THEME.secondaryBg};
  border-radius: 20px;
  padding: 8px 12px;
  margin-top: 10px;
`;

const GhostInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
`;

// --- Main Component ---
const CommentsSection = () => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'Amara Simba',
      text: 'This looks like a world-class application interface!',
      likes: 5,
      isLiked: false,
      replies: [],
      showReplyInput: false
    }
  ]);

  const handleLike = (id) => {
    setComments(comments.map(c => {
      if (c.id === id) {
        return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
      }
      return c;
    }));
  };

  const toggleReplyField = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, showReplyInput: !c.showReplyInput } : c));
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const newObj = {
      id: Date.now(),
      user: 'Current User',
      text: commentText,
      likes: 0,
      isLiked: false,
      replies: [],
      showReplyInput: false
    };
    setComments([newObj, ...comments]);
    setCommentText('');
  };

  return (
    <Section>
      <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Comments ({comments.length})</h3>
      
      {/* Top Level Input */}
      <InputBox style={{ marginBottom: '24px' }}>
        <Avatar src="https://ui-avatars.com/api/?name=Me&background=random" />
        <GhostInput 
          placeholder="Write a comment..." 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addComment()}
        />
        <Send 
          size={18} 
          color={commentText ? THEME.primary : '#ccc'} 
          style={{ cursor: 'pointer' }} 
          onClick={addComment}
        />
      </InputBox>

      {/* Render List */}
      {comments.map(comment => (
        <CommentGroup key={comment.id}>
          <FlexRow>
            <Avatar src={`https://ui-avatars.com/api/?name=${comment.user}`} />
            <ContentCard>
              <AuthorName>{comment.user}</AuthorName>
              <Text>{comment.text}</Text>
            </ContentCard>
            <MoreHorizontal size={16} color={THEME.textSecondary} style={{cursor: 'pointer'}} />
          </FlexRow>

          <ActionRow>
            <ActionBtn active={comment.isLiked} onClick={() => handleLike(comment.id)}>
              {comment.isLiked ? 'Liked' : 'Like'}
            </ActionBtn>
            <ActionBtn onClick={() => toggleReplyField(comment.id)}>Reply</ActionBtn>
            {comment.likes > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Heart size={12} fill={THEME.primary} color={THEME.primary} /> {comment.likes}
              </span>
            )}
            <span style={{fontWeight: 400}}>2h</span>
          </ActionRow>

          {/* Conditional Reply Input */}
          {comment.showReplyInput && (
            <ReplySection>
              <InputBox>
                <CornerDownRight size={16} color={THEME.textSecondary} />
                <GhostInput placeholder={`Reply to ${comment.user}...`} autoFocus />
                <Send size={16} color={THEME.primary} />
              </InputBox>
            </ReplySection>
          )}
        </CommentGroup>
      ))}
    </Section>
  );
};

export default CommentsSection;