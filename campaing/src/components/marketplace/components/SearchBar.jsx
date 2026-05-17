import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Search, X, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchProducts } from './api';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  
  &:focus-within {
    background: #ffffff;
    border-color: #1a1a2e;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 4px 8px;
  font-size: 15px;
  color: #1a1a2e;
  outline: none;

  &::placeholder {
    color: #94a3b8;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  z-index: 50;
`;

const SearchResult = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f8fafc;

  &:hover {
    background: #f8fafc;
  }
`;

const ResultImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ResultName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
`;

const ResultCategory = styled.span`
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const LoadingText = styled.div`
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
`;

const TrendingTerms = styled.div`
  padding: 16px;
`;

const TrendingTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #1a1a2e;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TermPill = styled.button`
  background: #f1f5f9;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
    color: #1a1a2e;
  }
`;

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const trendingTerms = ["Caps", "Hoodies", "Wristbands", "Premium Collection"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchProducts(query, 5);
        setResults(response?.data || (Array.isArray(response) ? response : []));
      } catch (err) {
        console.error("Search failed:", err);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (product) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/marketplace/product/${product.slug || product.id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      navigate(`/marketplace/shop?search=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  return (
    <SearchContainer ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit}>
        <InputWrapper>
          <Search size={18} color="#64748b" />
          <Input 
            type="text" 
            placeholder="Search merchandise, categories..." 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {query && (
            <X 
              size={16} 
              color="#64748b" 
              style={{ cursor: 'pointer' }}
              onClick={() => setQuery('')}
            />
          )}
        </InputWrapper>
      </form>

      {showDropdown && (
        <Dropdown>
          {query.trim() === '' ? (
            <TrendingTerms>
              <TrendingTitle>
                <TrendingUp size={14} /> Popular Searches
              </TrendingTitle>
              <PillContainer>
                {trendingTerms.map(term => (
                  <TermPill key={term} onClick={() => {
                    setQuery(term);
                    navigate(`/marketplace/shop?search=${encodeURIComponent(term)}`);
                    setShowDropdown(false);
                  }}>
                    {term}
                  </TermPill>
                ))}
              </PillContainer>
            </TrendingTerms>
          ) : loading ? (
            <LoadingText>Searching products...</LoadingText>
          ) : results.length > 0 ? (
            results.map((product) => (
              <SearchResult key={product.id || product.name} onClick={() => handleSelect(product)}>
                <ResultImage src={product.image || product.img || "https://ui-avatars.com/api/?name=Item"} alt={product.name} />
                <ResultInfo>
                  <ResultName>{product.name || product.title}</ResultName>
                  <ResultCategory>{product.category}</ResultCategory>
                </ResultInfo>
              </SearchResult>
            ))
          ) : (
            <LoadingText>No products found for "{query}"</LoadingText>
          )}
        </Dropdown>
      )}
    </SearchContainer>
  );
};

export default SearchBar;
