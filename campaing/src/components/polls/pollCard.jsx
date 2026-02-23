import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Share2,
  BarChart3,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

// Your Bold Theme
const THEME = {
  primaryDark: "#2C3E50",
  accentBlue: "#1e293b",
  white: "#FFFFFF",
  lightGray: "#F7F9FB",
  mediumGray: "#E9ECEF",
  darkGray: "#1e293b",
  successGreen: "#1DB954",
  dangerRed: "#C0392B",
  kinSuccess: "#00A896",
  autopsySuccess: "#6A0572",
  warningYellow: "#F39C12",
  orange: "#F97316",
  purple: "#8B5CF6",
  pink: "#EC4899",
  teal: "#14B8A6",
};

// Poll Data with Different Questions
const POLLS_DATA = [
  {
    id: 1,
    question: "Who is your preferred candidate for Nairobi Governor?",
    category: "Governor Race",
    totalVotes: 15420,
    shares: 2345,
    options: [
      { id: "a", label: "Johnson Sakaja", count: 7840, party: "UDA" },
      { id: "b", label: "Polycarp Igathe", count: 4580, party: "Jubilee" },
      { id: "c", label: "Esther Passaris", count: 2100, party: "ODM" },
      { id: "d", label: "Richard Ngatia", count: 900, party: "Independent" },
    ],
  },
  {
    id: 2,
    question: "Who would make the best President in 2027?",
    category: "Presidential Race",
    totalVotes: 28350,
    shares: 4567,
    options: [
      { id: "a", label: "William Ruto", count: 12450, party: "UDA" },
      { id: "b", label: "Raila Odinga", count: 8950, party: "ODM" },
      { id: "c", label: "Kalonzo Musyoka", count: 4250, party: "Wiper" },
      { id: "d", label: "Musalia Mudavadi", count: 2700, party: "ANC" },
    ],
  },
  {
    id: 3,
    question: "Which political party will win the most seats in 2027?",
    category: "Party Performance",
    totalVotes: 18900,
    shares: 1890,
    options: [
      { id: "a", label: "UDA - Kenya Kwanza", count: 8200, party: "UDA" },
      { id: "b", label: "ODM - Azimio", count: 6100, party: "ODM" },
      { id: "c", label: "Jubilee Party", count: 2600, party: "Jubilee" },
      { id: "d", label: "Wiper Party", count: 1200, party: "Wiper" },
      { id: "e", label: "ANC Party", count: 800, party: "ANC" },
    ],
  },
  {
    id: 4,
    question: "Who is the most trusted politician in Kenya?",
    category: "Trust Index",
    totalVotes: 21600,
    shares: 3120,
    options: [
      { id: "a", label: "Kalonzo Musyoka", count: 6800, party: "Wiper" },
      { id: "b", label: "Musalia Mudavadi", count: 5400, party: "ANC" },
      { id: "c", label: "Johnson Sakaja", count: 4800, party: "UDA" },
      { id: "d", label: "Gladys Wanga", count: 2800, party: "ODM" },
      { id: "e", label: "Martha Karua", count: 1800, party: "NARC Kenya" },
    ],
  },
  {
    id: 5,
    question: "Who will win the Nairobi Senatorial seat?",
    category: "Senator Race",
    totalVotes: 12700,
    shares: 1560,
    options: [
      { id: "a", label: "Edwin Sifuna", count: 5200, party: "ODM" },
      { id: "b", label: "Margaret Wanjiru", count: 3800, party: "UDA" },
      { id: "c", label: "Bishop Onesimus", count: 2100, party: "Independent" },
      { id: "d", label: "David Mberia", count: 1600, party: "Jubilee" },
    ],
  },
  {
    id: 6,
    question: "Rate the performance of Nairobi Governor Johnson Sakaja",
    category: "Performance Rating",
    totalVotes: 32400,
    shares: 2890,
    options: [
      {
        id: "a",
        label: "Excellent - 5 Stars",
        count: 8200,
        rating: "⭐⭐⭐⭐⭐",
      },
      { id: "b", label: "Good - 4 Stars", count: 10500, rating: "⭐⭐⭐⭐" },
      { id: "c", label: "Average - 3 Stars", count: 7800, rating: "⭐⭐⭐" },
      { id: "d", label: "Poor - 2 Stars", count: 3900, rating: "⭐⭐" },
      { id: "e", label: "Terrible - 1 Star", count: 2000, rating: "⭐" },
    ],
  },
  {
    id: 7,
    question: "What is the biggest issue facing Nairobi residents?",
    category: "Top Issues",
    totalVotes: 19800,
    shares: 2230,
    options: [
      {
        id: "a",
        label: "Traffic & Transport",
        count: 6800,
        issue: "Transport",
      },
      {
        id: "b",
        label: "Garbage Collection",
        count: 5200,
        issue: "Sanitation",
      },
      { id: "c", label: "Unemployment", count: 4100, issue: "Economy" },
      { id: "d", label: "Security", count: 2300, issue: "Safety" },
      {
        id: "e",
        label: "Flooding/Drainage",
        count: 1400,
        issue: "Infrastructure",
      },
    ],
  },
  {
    id: 8,
    question: "Will Raila Odinga get the AUC Chairmanship?",
    category: "Political Prediction",
    totalVotes: 22500,
    shares: 3450,
    options: [
      { id: "a", label: "Yes - Definitely", count: 9800, prediction: "Yes" },
      { id: "b", label: "No - He won't get it", count: 7200, prediction: "No" },
      {
        id: "c",
        label: "Too close to call",
        count: 5500,
        prediction: "Unsure",
      },
    ],
  },
];

// Generate engaging share message
const generateShareMessage = (poll, totalVotes, selectedOption) => {
  const topOption = [...poll.options].sort((a, b) => b.count - a.count)[0];
  const userOption = poll.options.find((opt) => opt.id === selectedOption);

  return `🗳️ I just voted in the "${poll.category}" poll on Siasa Hub!

📊 ${poll.question}

👑 Leading: ${topOption.label} with ${Math.round((topOption.count / totalVotes) * 100)}%
✅ My vote: ${userOption?.label || "Not selected"}

💰 ${totalVotes.toLocaleString()} Kenyans have already voted!

👇 Click to vote and see full results:
`;
};

const PollCard = ({ pollId, initialVoted = false }) => {
  const [voted, setVoted] = useState(initialVoted);
  const [selectedOption, setSelectedOption] = useState(null);
  const [votes, setVotes] = useState(null);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  // Initialize or get poll data
  useEffect(() => {
    const poll = POLLS_DATA.find((p) => p.id === pollId) || POLLS_DATA[0];
    setCurrentPoll(poll);
    setVotes(poll.options);
    setShareCount(poll.shares || 0);
  }, [pollId]);

  const handleVote = (optionId) => {
    if (voted || !votes) return;

    const updatedVotes = votes.map((opt) =>
      opt.id === optionId ? { ...opt, count: opt.count + 1 } : opt,
    );

    setVotes(updatedVotes);
    setSelectedOption(optionId);
    setVoted(true);

    // Update total votes in current poll
    if (currentPoll) {
      setCurrentPoll({
        ...currentPoll,
        totalVotes: currentPoll.totalVotes + 1,
      });
    }
  };

  const handleShare = (platform) => {
    if (!currentPoll || !votes) return;

    const totalVotes = votes.reduce((acc, curr) => acc + curr.count, 0);
    const shareMessage = generateShareMessage(
      currentPoll,
      totalVotes,
      selectedOption,
    );
    const shareUrl = window.location.href;

    // Increment share count
    setShareCount((prev) => prev + 1);

    let shareLink = "";

    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareMessage + "\n" + shareUrl)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareMessage + "\n" + shareUrl);
        alert("📋 Link copied to clipboard!");
        setShowShareOptions(false);
        return;
      default:
        if (navigator.share) {
          navigator
            .share({
              title: `Siasa Hub Poll: ${currentPoll.question}`,
              text: shareMessage,
              url: shareUrl,
            })
            .catch(() => {});
        }
    }

    if (shareLink) {
      window.open(shareLink, "_blank");
    }

    setShowShareOptions(false);
  };

  if (!currentPoll || !votes) {
    return <LoadingCard>Loading poll...</LoadingCard>;
  }

  const totalVotes = votes.reduce((acc, curr) => acc + curr.count, 0);
  const colors = [
    THEME.kinSuccess,
    THEME.autopsySuccess,
    THEME.warningYellow,
    THEME.successGreen,
    THEME.orange,
    THEME.purple,
    THEME.pink,
    THEME.teal,
  ];

  return (
    <CardContainer>
      <CardHeader>
        <Badge>
          <Pulse />
          {currentPoll.category} • LIVE
        </Badge>
        <TrendingUp size={16} color={THEME.dangerRed} />
      </CardHeader>

      <Question>{currentPoll.question}</Question>

      <ContentWrapper $voted={voted}>
        {/* BIG CIRCLE CHART */}
        {voted && (
          <ChartContainer>
            <svg viewBox="0 0 36 36" className="donut">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={THEME.lightGray}
                strokeWidth="3.5"
              />
              {votes.map((opt, i) => {
                const percent = (opt.count / totalVotes) * 100;
                const offset = votes
                  .slice(0, i)
                  .reduce((sum, o) => sum + (o.count / totalVotes) * 100, 0);

                return (
                  <path
                    key={opt.id}
                    className="donut-segment"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={
                      opt.id === selectedOption
                        ? THEME.dangerRed
                        : colors[i % colors.length]
                    }
                    strokeWidth="3.8"
                    strokeDasharray={`${percent} ${100 - percent}`}
                    strokeDashoffset={-offset + 25}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 1s ease" }}
                  />
                );
              })}
            </svg>
            <ChartCenter>
              <span className="total">{totalVotes.toLocaleString()}</span>
              <span className="sub">Votes</span>
            </ChartCenter>
          </ChartContainer>
        )}

        <OptionsGrid $voted={voted}>
          {votes.map((option, index) => {
            const percentage =
              totalVotes === 0
                ? 0
                : Math.round((option.count / totalVotes) * 100);
            const isSelected = option.id === selectedOption;
            const activeColor = isSelected
              ? THEME.dangerRed
              : colors[index % colors.length];

            return (
              <OptionRow
                key={option.id}
                onClick={() => handleVote(option.id)}
                $voted={voted}
                $isSelected={isSelected}
              >
                <RowMain>
                  <RadioCircle
                    $isSelected={isSelected}
                    $voted={voted}
                    $color={activeColor}
                  >
                    {isSelected && <CheckCircle2 size={12} strokeWidth={4} />}
                  </RadioCircle>
                  <LabelText $isSelected={isSelected}>
                    {option.label}
                    {option.party && <PartyTag>{option.party}</PartyTag>}
                    {option.rating && <RatingTag>{option.rating}</RatingTag>}
                    {option.issue && <IssueTag>{option.issue}</IssueTag>}
                  </LabelText>
                  {voted && (
                    <PercentLabel $color={activeColor}>
                      {percentage}%
                    </PercentLabel>
                  )}
                </RowMain>

                {voted && (
                  <MiniTrack>
                    <MiniFill $width={percentage} $color={activeColor} />
                  </MiniTrack>
                )}
              </OptionRow>
            );
          })}
        </OptionsGrid>
      </ContentWrapper>

      <Footer>
        <FooterInfo>
          <Users size={14} />
          <span>{totalVotes.toLocaleString()} votes</span>
          <Dot>•</Dot>
          <Share2 size={14} />
          <span>{shareCount.toLocaleString()} shares</span>
        </FooterInfo>

        {voted ? (
          <ShareBtn onClick={() => setShowShareOptions(!showShareOptions)}>
            <Share2 size={14} />
            Share Results
            {showShareOptions && (
              <ShareDropdown>
                <ShareOption onClick={() => handleShare("whatsapp")}>
                  <MessageCircle size={14} color="#25D366" />
                  WhatsApp
                </ShareOption>
                <ShareOption onClick={() => handleShare("twitter")}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#1DA1F2"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter/X
                </ShareOption>
                <ShareOption onClick={() => handleShare("facebook")}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#4267B2"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </ShareOption>
                <ShareOption onClick={() => handleShare("telegram")}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#0088cc"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.916.49-1.305.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Telegram
                </ShareOption>
                <ShareOption onClick={() => handleShare("copy")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#666">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                  Copy Link
                </ShareOption>
              </ShareDropdown>
            )}
          </ShareBtn>
        ) : (
          <VoteCount>
            <ThumbsUp size={14} />
            <span>Cast your vote</span>
          </VoteCount>
        )}
      </Footer>
    </CardContainer>
  );
};

// Export multiple poll cards for different questions
export const NairobiGovernorPoll = () => <PollCard pollId={1} />;
export const PresidentialPoll = () => <PollCard pollId={2} />;
export const PartyPoll = () => <PollCard pollId={3} />;
export const TrustPoll = () => <PollCard pollId={4} />;
export const SenatorPoll = () => <PollCard pollId={5} />;
export const SakajaPerformancePoll = () => <PollCard pollId={6} />;
export const NairobiIssuesPoll = () => <PollCard pollId={7} />;
export const RailaAUCPoll = () => <PollCard pollId={8} />;

// Main export with selector
export const PollSelector = ({ category }) => {
  const filteredPolls = category
    ? POLLS_DATA.filter((p) => p.category === category)
    : POLLS_DATA;

  return (
    <PollGrid>
      {filteredPolls.map((poll) => (
        <PollCard key={poll.id} pollId={poll.id} />
      ))}
    </PollGrid>
  );
};

// --- Styles ---
const pulse = keyframes` 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } `;
const grow = keyframes` from { width: 0; } to { width: var(--w); } `;
const slideUp = keyframes` from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } `;

const LoadingCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-weight: 600;
`;

const PollGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const CardContainer = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  margin: 0;
  border: 1px solid ${THEME.mediumGray};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 900;
  color: ${THEME.dangerRed};
  background: rgba(192, 57, 43, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
`;

const Pulse = styled.div`
  width: 6px;
  height: 6px;
  background: ${THEME.dangerRed};
  border-radius: 50%;
  animation: ${pulse} 1.5s infinite;
`;

const Question = styled.h3`
  font-size: 19px;
  font-weight: 900;
  color: ${THEME.primaryDark};
  line-height: 1.3;
  margin-bottom: 24px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (min-width: 600px) {
    flex-direction: ${(props) => (props.$voted ? "row" : "column")};
    align-items: center;
  }
`;

const ChartContainer = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  margin: 0 auto;
`;

const ChartCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .total {
    font-size: 22px;
    font-weight: 900;
    color: ${THEME.primaryDark};
  }
  .sub {
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
  }
`;

const OptionsGrid = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionRow = styled.div`
  cursor: ${(props) => (props.$voted ? "default" : "pointer")};
  padding: 12px;
  border-radius: 16px;
  background: ${(props) =>
    props.$isSelected ? THEME.lightGray : "transparent"};
  border: 1px solid
    ${(props) => (props.$isSelected ? THEME.dangerRed : "transparent")};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => !props.$voted && THEME.lightGray};
  }
`;

const RowMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: ${(props) => (props.children[2] ? "10px" : "0")};
  flex-wrap: wrap;
`;

const RadioCircle = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid
    ${(props) => (props.$isSelected ? props.$color : THEME.mediumGray)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color};
  background: ${(props) => (props.$isSelected ? props.$color : "transparent")};
`;

const LabelText = styled.span`
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: ${THEME.primaryDark};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PartyTag = styled.span`
  background: ${THEME.lightGray};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: ${THEME.darkGray};
`;

const RatingTag = styled.span`
  background: ${THEME.warningYellow}20;
  color: ${THEME.warningYellow};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
`;

const IssueTag = styled.span`
  background: ${THEME.teal}20;
  color: ${THEME.teal};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
`;

const PercentLabel = styled.span`
  font-size: 14px;
  font-weight: 900;
  color: ${(props) => props.$color};
  min-width: 45px;
  text-align: right;
`;

const MiniTrack = styled.div`
  height: 6px;
  background: ${THEME.mediumGray};
  border-radius: 10px;
  overflow: hidden;
  margin-left: 34px;
`;

const MiniFill = styled.div`
  height: 100%;
  --w: ${(props) => props.$width}%;
  width: var(--w);
  background: ${(props) => props.$color};
  animation: ${grow} 0.8s ease-out forwards;
`;

const Footer = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${THEME.mediumGray};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  flex-wrap: wrap;
  gap: 10px;
`;

const FooterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  flex-wrap: wrap;
`;

const Dot = styled.span`
  color: ${THEME.mediumGray};
  font-size: 14px;
`;

const ShareBtn = styled.button`
  background: ${THEME.primaryDark};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &:hover {
    background: ${THEME.dangerRed};
    transform: translateY(-2px);
  }
`;

const VoteCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${THEME.successGreen};
  font-size: 12px;
  font-weight: 600;
`;

const ShareDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid ${THEME.mediumGray};
  overflow: hidden;
  z-index: 10;
  animation: ${slideUp} 0.2s ease;
  min-width: 160px;
`;

const ShareOption = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: white;
  font-size: 12px;
  font-weight: 600;
  color: ${THEME.primaryDark};
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${THEME.lightGray};
  }
`;

export default PollCard;
