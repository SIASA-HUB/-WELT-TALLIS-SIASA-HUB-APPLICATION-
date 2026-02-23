import React, { Suspense, lazy } from "react";
import styled, { keyframes } from "styled-components";

import TrendingSection from "../treading/treading";
import PostCard from "../posts/postCard";

const shimmer = keyframes`
  0% { background-position: -468px 0 }
  100% { background-position: 468px 0 }
`;

const Container = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
`;

const SearchHeader = styled.div`
  padding: 10px 16px;
  background: #f0fdf4;
  border-bottom: 1px solid #bbf7d0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SkeletonBase = styled.div`
  background: #f6f7f8;
  background-image: linear-gradient(
    to right,
    #f6f7f8 0%,
    #edeef1 20%,
    #f6f7f8 40%,
    #f6f7f8 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 100%;
  display: inline-block;
  position: relative;
  animation: ${shimmer} 1.2s linear infinite forwards;
  border-radius: 12px;
  margin: 16px;
  width: calc(100% - 32px);
`;

const Loader = () => <SkeletonBase style={{ height: "200px" }} />;

export default function SiasaApp({ searchQuery = "", onClearSearch }) {
  const isSearching = searchQuery?.trim().length > 0;

  return (
    <Container>
      <main style={{ paddingBottom: "20px" }}>
        {isSearching && (
          <SearchHeader>
            <div
              style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}
            >
              <span style={{ color: "#0f172a" }}>"{searchQuery}"</span>
            </div>
            <button
              onClick={onClearSearch}
              style={{
                background: "none",
                border: "none",
                color: "#166534",
                fontSize: "12px",
                fontWeight: "600",
                textDecoration: "underline",
              }}
            >
              Clear
            </button>
          </SearchHeader>
        )}

        <TrendingSection />

        <PostCard searchQuery={searchQuery} />

        <Suspense fallback={<Loader />}></Suspense>
      </main>
    </Container>
  );
}
