export const useSentiment = (likes, dislikes) => {
  const total = likes + dislikes;
  const approval = total > 0 ? Math.round((likes / total) * 100) : 0;
  const disapproval = total > 0 ? Math.round((dislikes / total) * 100) : 0;
  
  return { approval, disapproval, total };
};