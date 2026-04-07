import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Search as SearchLucide } from "lucide-react"; // Using Lucide icon
import { useSelector, useDispatch } from "react-redux";
import { getProducts as listProducts } from "../../actions/productActions";
import { Link } from "react-router-dom";

// --- Styled Components ---

const SearchContainer = styled.div`
  background: #fff;
  width: 38%;
  border-radius: 2px;
  margin-left: 10px;
  display: flex;
  position: relative; /* Crucial for absolute positioning of results */
`;

const InputSearchBase = styled.input`
  padding-left: 20px;
  width: 100%;
  font-size: unset;
  border: none;
  outline: none;
  border-radius: 2px 0 0 2px;

  &::placeholder {
    color: #878787;
  }
`;

const SearchIconWrapper = styled.div`
  color: #2874f0;
  padding: 5px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ListWrapper = styled.ul`
  position: absolute;
  color: #000;
  background: #ffffff;
  top: 36px;
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  border-top: 1px solid #f0f0f0;
  z-index: 10;
`;

const ListItem = styled.li`
  padding: 10px 20px;

  &:hover {
    background-color: #f5faff;
  }

  & a {
    text-decoration: none;
    color: inherit;
    display: block;
    font-size: 14px;
  }
`;

// --- Component Logic ---

const Search = () => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(true);

  const getProducts = useSelector((state) => state.getProducts);
  const { products } = getProducts;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  const handleInputChange = (value) => {
    setText(value);
    setOpen(false);
  };

  return (
    <SearchContainer>
      <InputSearchBase
        placeholder="Search for products, brands and more"
        onChange={(e) => handleInputChange(e.target.value)}
        value={text}
      />
      <SearchIconWrapper>
        <SearchLucide size={20} />
      </SearchIconWrapper>

      {text && !open && (
        <ListWrapper>
          {products
            .filter((product) =>
              product.title.longTitle
                .toLowerCase()
                .includes(text.toLowerCase()),
            )
            .map((product) => (
              <ListItem key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  onClick={() => {
                    setOpen(true);
                    setText(product.title.longTitle);
                  }}
                >
                  {product.title.longTitle}
                </Link>
              </ListItem>
            ))}
        </ListWrapper>
      )}
    </SearchContainer>
  );
};

export default Search;
