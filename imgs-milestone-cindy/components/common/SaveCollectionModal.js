import React from "react";
import { Modal } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import {
  getCollections,
  createNewCollection,
  addAlbumToColletion
} from "../../redux/actions/collections";
import { getUserInfo } from "../../auth";
import config from "../../config";

function SaveCollectionModal({
  handleClose,
  dataCollections,
  albumId,
  publicid
}) {
  const dispatch = useDispatch();
  const isOpen = useSelector(store => store.modal.saveCollection);
  const user = getUserInfo();
  const userId = user._id;
  const [collectionName, setCollectionName] = React.useState("");

  const handleGetCollections = React.useCallback(() => {
    if (userId) {
      dispatch(getCollections({ userId }));
    }
  }, [dispatch, userId]);

  React.useEffect(() => {
    handleGetCollections();
  }, [handleGetCollections]);

  const handleChange = e => {
    setCollectionName(e.target.value);
  };

  const handleCreateCollection = async e => {
    e.preventDefault();
    if (collectionName) {
      try {
        await dispatch(
          createNewCollection({
            galleryid: albumId,
            userid: userId,
            collectionname: collectionName,
            photopublicid: publicid
          })
        );
        handleGetCollections();
        setCollectionName("");
      } catch (error) {
        console.log("err: ", error);
        setCollectionName("");
      }
    }
  };

  const handleSaveToCollection = collectionid => async e => {
    e.preventDefault();
    try {
      await dispatch(
        addAlbumToColletion({
          galleryid: albumId,
          userid: userId,
          collectionid,
          photopublicid: publicid
        })
      );
      handleGetCollections();
      setCollectionName("");
    } catch (error) {
      console.log("err: ", error);
      setCollectionName("");
    }
  };

  return (
    <Modal className="SaveCollectionModal" isOpen={isOpen} toggle={handleClose}>
      <div className="modal-header">
        <button className="close" onClick={() => handleClose()}>
          <span>×</span>
        </button>
        <h4 className="modal-title">Save to a Collection</h4>
      </div>
      <div className="modal-body">
        <div className="collection-view">
          <ul className="collection-list">
            {dataCollections.data &&
              dataCollections.data.map(collection => (
                <li
                  key={collection._id}
                  className="collection-item"
                  onClick={handleSaveToCollection(collection._id)}
                >
                  <div className="item-image">
                    <img
                      src={
                        collection.images.length &&
                        `${config.ftpThumbnailPath}${collection.images[0] &&
                          collection.images[0].publicid}.jpg`
                      }
                      alt=""
                    />
                  </div>
                  <div className="collection-info">
                    <h5 className="collection-item-heading">
                      {collection.name}
                    </h5>
                    <h5 className="collection-item-text">
                      {collection.images.length} photos
                    </h5>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="modal-footer">
        <form className="modal-form">
          <input
            type="text"
            className="modal-input"
            placeholder="New collection..."
            onChange={handleChange}
          />
          <button className="modal-button" onClick={handleCreateCollection}>
            Create
          </button>
        </form>
      </div>
    </Modal>
  );
}

export default SaveCollectionModal;
