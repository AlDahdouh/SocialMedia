import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getPosts, addLike, removeLike, deletePost } from "../../actions/post";
import Spinner from "../layout/Spinner";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import PostForm from "./PostForm";

const Posts = ({
  getPosts,
  addLike,
  removeLike,
  deletePost,
  auth,
  post: { posts, loading },
}) => {
  useEffect(() => {
    getPosts();
  }, [getPosts]);

  if (posts === null && posts == null && loading) {
    return <Spinner />;
  }
  const postsList = posts.map((post) => (
    <div key={post._id} className="post bg-white p-1 my-1">
      <div>
        <Link to={`/profile/${post.user}`}>
          <img className="round-img" src={post.avatar} alt="" />
          <h4>{post.name}</h4>
        </Link>
      </div>
      <div>
        <p className="my-1">{post.text}</p>
        <p className="post-date">
          Posted on <Moment format="YYYY/MM/DD">{post.date}</Moment>
        </p>
        <button
          type="button"
          onClick={(e) => addLike(post._id)}
          className="btn btn-light"
        >
          <i className="fas fa-thumbs-up"></i>
          {post.likes.length > 0 && <span>{post.likes.length}</span>}
        </button>
        <button
          type="button"
          onClick={(e) => removeLike(post._id)}
          className="btn btn-light"
        >
          <i className="fas fa-thumbs-down"></i>
        </button>
        <Link to={`/posts/${post._id}`} className="btn btn-primary">
          Discussion{" "}
          {post.comments.length > 0 && (
            <span className="comment-count">{post.comments.length}</span>
          )}
        </Link>
        {!auth.loading && post.user === auth.user._id && (
          <button
            type="button"
            onClick={(e) => deletePost(post._id)}
            className="btn btn-danger"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
    </div>
  ));

  return (
    <>
      <h1 className="large text-primary">Posts</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Welcome to the community!
      </p>

      <PostForm />

      <div className="posts">{postsList}</div>
    </>
  );
};

Posts.propTypes = {
  post: PropTypes.object.isRequired,
  getPosts: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  addLike: PropTypes.func.isRequired,
  removeLike: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    post: state.post,
    auth: state.auth,
  };
};

export default connect(mapStateToProps, {
  getPosts,
  removeLike,
  addLike,
  deletePost,
})(Posts);
