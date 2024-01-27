import * as model from './model';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import 'core-js/stable'; // polyfill everything else 
import 'regenerator-runtime/runtime'; // polyfill async await
import { MODAL_CLOSE_SEC } from './config';


const controlRecipes = async function() {
  try {

    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);

  } catch (error) {
    recipeView.renderError()
  }

}

const controlSearchResults = async function() {
  try {
    // 0) display spinner
    resultsView.renderSpinner();

    // 1) Get Search query
    const query = searchView.getQuery();
    if(!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());


    // 4) Render pagination buttons
    paginationView.render(model.state.search);
    
  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function(goToPage) {
    // 1) Render NEW results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(goToPage));


    // 2) Render NEW pagination buttons
    paginationView.render(model.state.search);
}

const controlServings = function(newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings)

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function() {
  // add/remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.removeBookmark(model.state.recipe.id)
  }

  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmark
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

const contorlAddRecipe = async function(newRecipe) {
  try {
    // Render spinnr
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmar view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState('null', '', `#${model.state.recipe.id}`);

    // Close form
    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error(error);
    addRecipeView.renderError(error.message);
  }
}

const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpadateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(contorlAddRecipe);
}

init();