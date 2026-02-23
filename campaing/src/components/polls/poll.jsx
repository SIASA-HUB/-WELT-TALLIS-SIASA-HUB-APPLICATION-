import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Share2,
  BarChart3,
  ThumbsUp,
  MessageCircle,
  Award,
  Flame,
  Zap,
  Heart,
  Copy,
  Camera,
  Download,
  ChevronLeft,
  Filter,
  X,
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

// Poll Data with All Questions
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

// Generate beautiful share message
const generateShareMessage = (poll, selectedOption) => {
  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.count, 0);
  const topOption = [...poll.options].sort((a, b) => b.count - a.count)[0];
  const userOption = poll.options.find((opt) => opt.id === selectedOption);

  return `📊 *KENYA POLL RESULTS* 📊
━━━━━━━━━━━━━━━━━━
🗳️ *${poll.question}*
━━━━━━━━━━━━━━━━━━

${poll.options
  .map((opt) => {
    const percent = Math.round((opt.count / totalVotes) * 100);
    const bar =
      "█".repeat(Math.floor(percent / 5)) +
      "░".repeat(20 - Math.floor(percent / 5));
    const isUserChoice = opt.id === selectedOption ? "✅ " : "• ";
    return `${isUserChoice}${opt.label} ${opt.party ? `(${opt.party})` : ""}
  ${bar} ${percent}% (${opt.count.toLocaleString()} votes)`;
  })
  .join("\n\n")}

━━━━━━━━━━━━━━━━━━
💰 Total Votes: ${totalVotes.toLocaleString()}
👑 Leading: ${topOption.label} with ${Math.round((topOption.count / totalVotes) * 100)}%
━━━━━━━━━━━━━━━━━━

🔥 *I just voted! What's your take?*
👇 Click to vote and see full results on Siasa Hub 🇰🇪

#KenyaDecides2027 #SiasaHub #ElectionsKE`;
};

// Generate beautiful share image HTML
const generateShareHTML = (poll) => {
  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.count, 0);
  const topOption = [...poll.options].sort((a, b) => b.count - a.count)[0];

  return `
    <div style="
      background: linear-gradient(135deg, #2C3E50 0%, #1e293b 100%);
      color: white;
      padding: 40px;
      border-radius: 40px;
      font-family: 'Arial', sans-serif;
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 30px 60px rgba(0,0,0,0.4);
      border: 2px solid rgba(255,255,255,0.1);
    ">
      <!-- Header with Logo -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 50px; height: 50px; background: #C0392B; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 28px; transform: rotate(-5deg); box-shadow: 0 10px 20px rgba(192,57,43,0.3);">
            🇰🇪
          </div>
          <div>
            <div style="font-size: 14px; color: #94a3b8; letter-spacing: 1px;">LIVE POLL RESULTS</div>
            <div style="font-size: 24px; font-weight: 900; background: linear-gradient(135deg, #fff 0%, #F97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Siasa Hub</div>
          </div>
        </div>
        <div style="background: rgba(249,115,22,0.2); padding: 8px 16px; border-radius: 40px; border: 1px solid #F97316;">
          <span style="color: #F97316; font-weight: bold;">🔥 TRENDING</span>
        </div>
      </div>
      
      <!-- Question -->
      <div style="font-size: 26px; font-weight: 900; margin-bottom: 30px; line-height: 1.3; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
        ${poll.question}
      </div>
      
      <!-- Results -->
      <div style="margin-bottom: 30px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 20px;">
        ${poll.options
          .map((opt, index) => {
            const percent = Math.round((opt.count / totalVotes) * 100);
            const colors = [
              "#F97316",
              "#8B5CF6",
              "#EC4899",
              "#14B8A6",
              "#00A896",
              "#6A0572",
            ];
            return `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: bold; font-size: 15px;">${opt.label} ${opt.party ? `(${opt.party})` : ""}</span>
                <span style="color: ${colors[index % colors.length]}; font-weight: 900; font-size: 16px;">${percent}%</span>
              </div>
              <div style="height: 10px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; position: relative;">
                <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]}); border-radius: 10px; transition: width 0.5s ease;"></div>
              </div>
              <div style="text-align: right; margin-top: 4px; color: #94a3b8; font-size: 12px;">
                ${opt.count.toLocaleString()} votes
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
      
      <!-- Stats -->
      <div style="display: flex; justify-content: space-between; padding: 20px 0; border-top: 2px solid rgba(255,255,255,0.1); border-bottom: 2px solid rgba(255,255,255,0.1); margin-bottom: 25px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">💰</span>
          <div>
            <div style="font-size: 12px; color: #94a3b8;">Total Votes</div>
            <div style="font-size: 20px; font-weight: 900;">${totalVotes.toLocaleString()}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">👑</span>
          <div>
            <div style="font-size: 12px; color: #94a3b8;">Leading</div>
            <div style="font-size: 16px; font-weight: 900;">${topOption.label}</div>
          </div>
        </div>
      </div>
      
      <!-- CTA -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="background: linear-gradient(135deg, #C0392B, #F97316); color: white; padding: 15px 30px; border-radius: 50px; font-weight: 900; font-size: 18px; box-shadow: 0 10px 20px rgba(192,57,43,0.3);">
          👆 Cast Your Vote Now
        </div>
        <div style="color: #94a3b8; font-size: 14px;">
          Join ${totalVotes.toLocaleString()}+ Kenyans
        </div>
      </div>
    </div>
  `;
};

const PollCard = ({ poll, onVote, onShare }) => {
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [votes, setVotes] = useState(poll.options);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareCount, setShareCount] = useState(poll.shares || 0);
  const [showScreenshotPreview, setShowScreenshotPreview] = useState(false);

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

  const handleVote = (optionId) => {
    if (voted) return;

    const updatedVotes = votes.map((opt) =>
      opt.id === optionId ? { ...opt, count: opt.count + 1 } : opt,
    );

    setVotes(updatedVotes);
    setSelectedOption(optionId);
    setVoted(true);

    if (onVote) {
      onVote(poll.id, optionId);
    }
  };

  const handleShare = (platform) => {
    const shareMessage = generateShareMessage(
      { ...poll, options: votes },
      selectedOption,
    );
    const shareUrl = window.location.href;

    setShareCount((prev) => prev + 1);
    if (onShare) {
      onShare(poll.id, platform);
    }

    let shareLink = "";

    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareMessage + "\n\n" + shareUrl)}`;
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
        navigator.clipboard.writeText(shareMessage + "\n\n" + shareUrl);
        alert("📋 Link copied to clipboard!");
        setShowShareOptions(false);
        return;
      case "screenshot":
        setShowScreenshotPreview(true);
        setShowShareOptions(false);
        return;
      default:
        if (navigator.share) {
          navigator
            .share({
              title: `Siasa Hub Poll: ${poll.question}`,
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

  const downloadScreenshot = () => {
    const html = generateShareHTML({ ...poll, options: votes });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `siasa-poll-${poll.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowScreenshotPreview(false);
    setShareCount((prev) => prev + 1);
    if (onShare) {
      onShare(poll.id, "screenshot");
    }
  };

  return (
    <CardContainer>
      <CardHeader>
        <Badge>
          <Pulse />
          {poll.category} • LIVE
        </Badge>
        <TrendingUp size={16} color={THEME.dangerRed} />
      </CardHeader>

      <Question>{poll.question}</Question>

      <ContentWrapper $voted={voted}>
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
                  <TwitterIcon size={14} color="#1DA1F2" />
                  Twitter/X
                </ShareOption>
                <ShareOption onClick={() => handleShare("facebook")}>
                  <FacebookIcon size={14} color="#4267B2" />
                  Facebook
                </ShareOption>
                <ShareOption onClick={() => handleShare("telegram")}>
                  <TelegramIcon size={14} color="#0088cc" />
                  Telegram
                </ShareOption>
                <ShareOption onClick={() => handleShare("screenshot")}>
                  <Camera size={14} color="#F97316" />
                  Beautiful Image
                </ShareOption>
                <ShareOption onClick={() => handleShare("copy")}>
                  <Copy size={14} color="#666" />
                  Copy Link
                </ShareOption>
              </ShareDropdown>
            )}
          </ShareBtn>
        ) : (
          <VoteCount>
            <ThumbsUp size={14} />
            <span>Vote to see results</span>
          </VoteCount>
        )}
      </Footer>

      {/* Beautiful Screenshot Preview Modal */}
      {showScreenshotPreview && (
        <PreviewOverlay onClick={() => setShowScreenshotPreview(false)}>
          <PreviewContent onClick={(e) => e.stopPropagation()}>
            <PreviewHeader>
              <PreviewTitle>
                <Camera size={20} color={THEME.orange} />
                Beautiful Share Image
              </PreviewTitle>
              <CloseButton onClick={() => setShowScreenshotPreview(false)}>
                <X size={20} />
              </CloseButton>
            </PreviewHeader>

            <PreviewBody>
              <PreviewCard>
                <PreviewCardHeader>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <PreviewLogoIcon>🇰🇪</PreviewLogoIcon>
                    <div>
                      <PreviewBadge>LIVE POLL RESULTS</PreviewBadge>
                      <PreviewLogoText>Siasa Hub</PreviewLogoText>
                    </div>
                  </div>
                  <TrendingBadge>🔥 TRENDING</TrendingBadge>
                </PreviewCardHeader>

                <PreviewQuestion>{poll.question}</PreviewQuestion>

                <PreviewOptions>
                  {votes.map((opt, i) => {
                    const percent = Math.round((opt.count / totalVotes) * 100);
                    const colors = ["#F97316", "#8B5CF6", "#EC4899", "#14B8A6"];
                    return (
                      <PreviewOption key={opt.id}>
                        <PreviewOptionLabel>
                          <span style={{ fontWeight: "bold" }}>
                            {opt.label} {opt.party && `(${opt.party})`}
                          </span>
                          <span
                            style={{
                              color: colors[i % colors.length],
                              fontWeight: "900",
                            }}
                          >
                            {percent}%
                          </span>
                        </PreviewOptionLabel>
                        <PreviewBar>
                          <PreviewBarFill
                            $width={percent}
                            $color={colors[i % colors.length]}
                          />
                        </PreviewBar>
                        <PreviewVoteCount>
                          {opt.count.toLocaleString()} votes
                        </PreviewVoteCount>
                      </PreviewOption>
                    );
                  })}
                </PreviewOptions>

                <PreviewStats>
                  <StatItem>
                    <StatIcon>💰</StatIcon>
                    <div>
                      <StatLabel>Total Votes</StatLabel>
                      <StatValue>{totalVotes.toLocaleString()}</StatValue>
                    </div>
                  </StatItem>
                  <StatItem>
                    <StatIcon>👑</StatIcon>
                    <div>
                      <StatLabel>Leading</StatLabel>
                      <StatValue>
                        {votes.sort((a, b) => b.count - a.count)[0].label}
                      </StatValue>
                    </div>
                  </StatItem>
                </PreviewStats>

                <PreviewCTA>
                  <CTAButton>👆 Cast Your Vote Now</CTAButton>
                  <CTAText>Join {totalVotes.toLocaleString()}+ Kenyans</CTAText>
                </PreviewCTA>
              </PreviewCard>

              <DownloadButton onClick={downloadScreenshot}>
                <Download size={18} />
                Download Beautiful Image
              </DownloadButton>
              <PreviewNote>
                ✨ Download and share this beautiful image on social media
              </PreviewNote>
            </PreviewBody>
          </PreviewContent>
        </PreviewOverlay>
      )}
    </CardContainer>
  );
};

// Main Polls Listing Page
const PollsPage = ({ onBack }) => {
  const [polls, setPolls] = useState(POLLS_DATA);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["All", ...new Set(polls.map((p) => p.category))];

  const handleVote = (pollId, optionId) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) =>
        poll.id === pollId
          ? { ...poll, totalVotes: poll.totalVotes + 1 }
          : poll,
      ),
    );
  };

  const handleShare = (pollId, platform) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) =>
        poll.id === pollId ? { ...poll, shares: (poll.shares || 0) + 1 } : poll,
      ),
    );
  };

  const filteredPolls = polls.filter(
    (poll) => selectedCategory === "All" || poll.category === selectedCategory,
  );

  return (
    <PageContainer>
      <StickyHeader>
        <HeaderContent>
          <HeaderLeft>
            <BackButton onClick={onBack}>
              <ChevronLeft size={24} />
            </BackButton>
            <PageTitle>
              <Flame size={24} color={THEME.orange} />
              Polls
            </PageTitle>
          </HeaderLeft>
          <FilterButton onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            {selectedCategory !== "All" && <FilterDot />}
          </FilterButton>
        </HeaderContent>

        {showFilters && (
          <FilterSection>
            <FilterHeader>
              <FilterTitle>Categories</FilterTitle>
              {selectedCategory !== "All" && (
                <ClearButton
                  onClick={() => {
                    setSelectedCategory("All");
                    setShowFilters(false);
                  }}
                >
                  Clear
                </ClearButton>
              )}
            </FilterHeader>
            <FilterBar>
              {categories.map((category) => (
                <FilterChip
                  key={category}
                  active={selectedCategory === category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowFilters(false);
                  }}
                >
                  {category}
                </FilterChip>
              ))}
            </FilterBar>
          </FilterSection>
        )}
      </StickyHeader>

      <PollsGrid>
        {filteredPolls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            onVote={handleVote}
            onShare={handleShare}
          />
        ))}
      </PollsGrid>

      {filteredPolls.length === 0 && (
        <EmptyState>
          <Award size={48} color="#94a3b8" />
          <h3>No polls found</h3>
          <p>Try selecting a different category</p>
        </EmptyState>
      )}
    </PageContainer>
  );
};

// Styles
const fadeIn = keyframes` from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } `;
const pulse = keyframes` 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } `;
const grow = keyframes` from { width: 0; } to { width: var(--w); } `;
const slideUp = keyframes` from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } `;

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid ${THEME.mediumGray};
  padding: 12px 20px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  background: ${THEME.lightGray};
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${THEME.primaryDark};
  transition: all 0.2s;

  &:hover {
    background: ${THEME.mediumGray};
    color: ${THEME.dangerRed};
  }
`;

const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: ${THEME.primaryDark};
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
`;

const FilterButton = styled.button`
  background: ${THEME.lightGray};
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${THEME.primaryDark};
  position: relative;
  transition: all 0.2s;

  &:hover {
    background: ${THEME.mediumGray};
    color: ${THEME.dangerRed};
  }
`;

const FilterDot = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  background: ${THEME.dangerRed};
  border-radius: 50%;
  border: 2px solid white;
`;

const FilterSection = styled.div`
  margin-top: 15px;
  animation: ${slideUp} 0.2s ease;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const FilterTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${THEME.dangerRed};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;

  &:hover {
    background: ${THEME.lightGray};
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button`
  background: ${(props) => (props.active ? THEME.dangerRed : "white")};
  color: ${(props) => (props.active ? "white" : THEME.primaryDark)};
  border: 1px solid
    ${(props) => (props.active ? THEME.dangerRed : THEME.mediumGray)};
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.active ? THEME.dangerRed : THEME.lightGray};
  }
`;

const PollsGrid = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  padding: 0 20px;
  animation: ${fadeIn} 0.4s ease;
`;

const CardContainer = styled.div`
  background: white;
  border-radius: 24px;
  padding: 20px;
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
  margin-bottom: 12px;
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
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
  font-size: 17px;
  font-weight: 900;
  color: ${THEME.primaryDark};
  line-height: 1.3;
  margin-bottom: 16px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: 600px) {
    flex-direction: ${(props) => (props.$voted ? "row" : "column")};
    align-items: center;
  }
`;

const ChartContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
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
    font-size: 20px;
    font-weight: 900;
    color: ${THEME.primaryDark};
  }
  .sub {
    font-size: 9px;
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
  gap: 8px;
`;

const OptionRow = styled.div`
  cursor: ${(props) => (props.$voted ? "default" : "pointer")};
  padding: 8px;
  border-radius: 12px;
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
  gap: 8px;
  margin-bottom: ${(props) => (props.children[2] ? "6px" : "0")};
  flex-wrap: wrap;
`;

const RadioCircle = styled.div`
  width: 18px;
  height: 18px;
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
  font-size: 12px;
  font-weight: 600;
  color: ${THEME.primaryDark};
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const PartyTag = styled.span`
  background: ${THEME.lightGray};
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 8px;
  font-weight: 600;
  color: ${THEME.darkGray};
`;

const RatingTag = styled.span`
  background: ${THEME.warningYellow}20;
  color: ${THEME.warningYellow};
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 8px;
  font-weight: 700;
`;

const IssueTag = styled.span`
  background: ${THEME.teal}20;
  color: ${THEME.teal};
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 8px;
  font-weight: 600;
`;

const PercentLabel = styled.span`
  font-size: 12px;
  font-weight: 900;
  color: ${(props) => props.$color};
  min-width: 35px;
  text-align: right;
`;

const MiniTrack = styled.div`
  height: 4px;
  background: ${THEME.mediumGray};
  border-radius: 10px;
  overflow: hidden;
  margin-left: 26px;
`;

const MiniFill = styled.div`
  height: 100%;
  --w: ${(props) => props.$width}%;
  width: var(--w);
  background: ${(props) => props.$color};
  animation: ${grow} 0.8s ease-out forwards;
`;

const Footer = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid ${THEME.mediumGray};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  flex-wrap: wrap;
  gap: 8px;
`;

const FooterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  flex-wrap: wrap;
`;

const Dot = styled.span`
  color: ${THEME.mediumGray};
  font-size: 12px;
`;

const ShareBtn = styled.button`
  background: ${THEME.primaryDark};
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
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
  gap: 4px;
  color: ${THEME.successGreen};
  font-size: 11px;
  font-weight: 600;
`;

const ShareDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid ${THEME.mediumGray};
  overflow: hidden;
  z-index: 10;
  animation: ${slideUp} 0.2s ease;
  min-width: 160px;
`;

const ShareOption = styled.button`
  width: 100%;
  padding: 10px 14px;
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

// Preview Modal Styles
const PreviewOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
  padding: 16px;
`;

const PreviewContent = styled.div`
  background: white;
  border-radius: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${THEME.mediumGray};
`;

const PreviewTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${THEME.primaryDark};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: ${THEME.lightGray};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${THEME.primaryDark};
  transition: all 0.2s;

  &:hover {
    background: ${THEME.mediumGray};
  }
`;

const PreviewBody = styled.div`
  padding: 24px;
`;

const PreviewCard = styled.div`
  background: linear-gradient(135deg, #2c3e50 0%, #1e293b 100%);
  color: white;
  padding: 32px;
  border-radius: 32px;
  margin-bottom: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const PreviewCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PreviewLogoIcon = styled.div`
  width: 44px;
  height: 44px;
  background: #c0392b;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transform: rotate(-5deg);
  box-shadow: 0 10px 20px rgba(192, 57, 43, 0.3);
`;

const PreviewBadge = styled.div`
  font-size: 11px;
  color: #94a3b8;
  letter-spacing: 1px;
  margin-bottom: 2px;
`;

const PreviewLogoText = styled.div`
  font-size: 20px;
  font-weight: 900;
  background: linear-gradient(135deg, #fff 0%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const TrendingBadge = styled.div`
  background: rgba(249, 115, 22, 0.2);
  padding: 6px 14px;
  border-radius: 40px;
  border: 1px solid #f97316;
  color: #f97316;
  font-weight: bold;
  font-size: 12px;
`;

const PreviewQuestion = styled.div`
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 28px;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const PreviewOptions = styled.div`
  margin-bottom: 28px;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 20px;
`;

const PreviewOption = styled.div`
  margin-bottom: 18px;
`;

const PreviewOptionLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
`;

const PreviewBar = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 4px;
`;

const PreviewBarFill = styled.div`
  width: ${(props) => props.$width}%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${(props) => props.$color},
    ${(props) => props.$color}dd
  );
  border-radius: 10px;
  transition: width 0.5s ease;
`;

const PreviewVoteCount = styled.div`
  text-align: right;
  color: #94a3b8;
  font-size: 11px;
`;

const PreviewStats = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatIcon = styled.span`
  font-size: 22px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #94a3b8;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 900;
`;

const PreviewCTA = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CTAButton = styled.div`
  background: linear-gradient(135deg, #c0392b, #f97316);
  color: white;
  padding: 14px 28px;
  border-radius: 50px;
  font-weight: 900;
  font-size: 16px;
  box-shadow: 0 10px 20px rgba(192, 57, 43, 0.3);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(192, 57, 43, 0.4);
  }
`;

const CTAText = styled.div`
  color: #94a3b8;
  font-size: 13px;
`;

const DownloadButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, ${THEME.successGreen}, #169c4a);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(29, 185, 84, 0.3);
  }
`;

const PreviewNote = styled.p`
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;

  h3 {
    font-size: 18px;
    margin: 15px 0 5px;
    color: ${THEME.primaryDark};
  }

  p {
    font-size: 14px;
  }
`;

// Icon Components
const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TelegramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.916.49-1.305.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

export default PollsPage;
