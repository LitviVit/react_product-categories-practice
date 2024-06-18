/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';
import { SORT_FIELD } from './constants';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(c => c.id === product.categoryId);
  const user = usersFromServer.find(u => u.id === category.ownerId);

  return { ...product, category, user };
});

export const App = () => {
  const [userId, setUserId] = useState(0);
  const [query, setQuery] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [sortField, setSortField] = useState('');
  const [isReversed, setIsReversed] = useState(false);

  const sortTable = field => {
    if (sortField !== field) {
      setSortField(field);
      setIsReversed(false);
    } else if (!isReversed) {
      setIsReversed(true);
    } else {
      setSortField('');
      setIsReversed(false);
    }
  };

  const resetAllFilters = () => {
    setQuery('');
    setUserId(0);
    setCategoryIds([]);
  };

  let visibleProducts = [...products];

  if (userId) {
    visibleProducts = visibleProducts.filter(p => p.user.id === userId);
  }

  if (query) {
    const normalizedQuery = query.toLowerCase();

    visibleProducts = visibleProducts.filter(p =>
      p.name.toLowerCase().includes(normalizedQuery),
    );
  }

  if (categoryIds.length > 0) {
    visibleProducts = visibleProducts.filter(p =>
      categoryIds.includes(p.categoryId),
    );
  }

  if (sortField) {
    visibleProducts.sort((productA, productB) => {
      switch (sortField) {
        case SORT_FIELD.ID:
          return productA.id - productB.id;

        case SORT_FIELD.PRODUCT:
          return productA.name.localeCompare(productB.name);

        case SORT_FIELD.CATEGORY: {
          const cATitle = productA.category.title || '';
          const cBTitle = productB.category.title || '';

          return cATitle.localeCompare(cBTitle);
        }

        case SORT_FIELD.USER: {
          const uAName = productA.user.name || '';
          const uBName = productB.user.name || '';

          return uAName.localeCompare(uBName);
        }

        default:
          return 0;
      }
    });
  }

  if (isReversed) {
    visibleProducts.reverse();
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={userId === 0 ? 'is-active' : ''}
                onClick={() => setUserId(0)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  key={user.id}
                  href="#/"
                  onClick={() => setUserId(user.id)}
                  className={user.id === userId ? 'is-active' : ''}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="search"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                data-cy="AllCategories"
                href="#/"
                className={`button is-success mr-6 ${categoryIds.length !== 0 && 'is-outlined'}`}
                onClick={() => setCategoryIds([])}
              >
                All
              </a>

              {categoriesFromServer.map(category =>
                categoryIds.includes(category.id) ? (
                  <a
                    data-cy="Category"
                    key={category.id}
                    className="button mr-2 my-1 is-info"
                    href="#/"
                    onClick={() => {
                      setCategoryIds(currentCategoryIds =>
                        currentCategoryIds.filter(id => id !== category.id),
                      );
                    }}
                  >
                    {category.title}
                  </a>
                ) : (
                  <a
                    data-cy="Category"
                    key={category.id}
                    className="button mr-2 my-1"
                    href="#/"
                    onClick={() => {
                      setCategoryIds(currentCategoryIds => [
                        ...currentCategoryIds,
                        category.id,
                      ]);
                    }}
                  >
                    {category.title}
                  </a>
                ),
              )}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetAllFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/" onClick={() => sortTable(SORT_FIELD.ID)}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={`fas ${sortField !== SORT_FIELD.ID && 'fa-sort'}
                              ${sortField === SORT_FIELD.ID && isReversed && 'fa-sort-down'}
                              ${sortField === SORT_FIELD.ID && !isReversed && 'fa-sort-up'}`}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a
                        href="#/"
                        onClick={() => sortTable(SORT_FIELD.PRODUCT)}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={`fas ${sortField !== SORT_FIELD.PRODUCT && 'fa-sort'}
                              ${sortField === SORT_FIELD.PRODUCT && isReversed && 'fa-sort-down'}
                              ${sortField === SORT_FIELD.PRODUCT && !isReversed && 'fa-sort-up'}`}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a
                        href="#/"
                        onClick={() => sortTable(SORT_FIELD.CATEGORY)}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={`fas ${sortField !== SORT_FIELD.CATEGORY && 'fa-sort'}
                              ${sortField === SORT_FIELD.CATEGORY && isReversed && 'fa-sort-down'}
                              ${sortField === SORT_FIELD.CATEGORY && !isReversed && 'fa-sort-up'}`}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/" onClick={() => sortTable('user')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={`fas ${sortField !== SORT_FIELD.USER && 'fa-sort'}
                              ${sortField === SORT_FIELD.USER && isReversed && 'fa-sort-down'}
                              ${sortField === SORT_FIELD.USER && !isReversed && 'fa-sort-up'}`}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">{`${product.category.icon} - ${product.category.title}`}</td>

                    <td
                      data-cy="ProductUser"
                      className={
                        product.user.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
