import React from 'react';
import styled from 'styled-components';

const KENYA_THEME = {
  text: {
    primary: '#0F172A',
  }
};

const Content = styled.div`
  padding: 20px;
  color: ${KENYA_THEME.text.primary};
  line-height: 1.6;
  font-size: 15px;
  background: white;
  
  p {
    margin: 0;
  }
`;

export default function PostContent({ content }) {
  return (
    <Content>
      <p>{content}</p>
    </Content>
  );
}