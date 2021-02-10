import {
  GET_POSTS,
  POST_ERROR,
  UPDATE_LIKES,
  DELETE_POST,
  ADD_POST,
} from "../actions/types";
const initalState = {
  post: null,
  posts: [],
  loading: true,
  error: {},
};

const post = (state = initalState, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_POSTS:
      return { ...state, posts: payload, loading: false, error: {} };
    case ADD_POST:
      return { ...state, loading: false, posts: [payload, ...state.posts] };
    case POST_ERROR:
      return { ...state, loading: false, error: payload };
    case DELETE_POST:
      return {
        ...state,
        posts: state.posts.filter((post) => post._id !== payload.id),
        loading: false,
      };
    case UPDATE_LIKES:
      return {
        ...state,
        loading: false,
        posts: state.posts.map((post) =>
          post._id === payload.id ? { ...post, likes: payload.likes } : post
        ),
      };
    default:
      return state;
  }
};

export default post;
