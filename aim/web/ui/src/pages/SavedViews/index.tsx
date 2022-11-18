import React from 'react';
import { NavLink } from 'react-router-dom';

import { useModel } from '../../hooks';
import bookmarkAppModel from '../../services/models/bookmarks/bookmarksAppModel';
import BookmarkCard from '../Bookmarks/components/BookmarkCard/BookmarkCard';

function ViewItem({ data }: any) {
  if (data.type === 'figures') {
    data.type = 'figures-explorer';
  }
  return (
    <div>
      <NavLink to={`/saved-views/${data.app_id}`}>
        <BookmarkCard {...data} />
      </NavLink>
    </div>
  );
}

function SavedViews() {
  const bookmarksData = useModel(bookmarkAppModel);

  React.useEffect(() => {
    bookmarkAppModel.initialize();

    return () => {
      bookmarkAppModel.destroy();
    };
  }, []);

  const render = React.useMemo(() => {
    return bookmarksData?.listData
      ?.filter((item) => item.type === 'figures' || item.type === 'audio')
      ?.map((item, index) => <ViewItem key={index} data={item} />);
  }, [bookmarksData?.listData]);

  return (
    <div className='flex fdc'>
      {bookmarksData?.listData.length ? render : <div>Loading ... </div>}
    </div>
  );
}

export default SavedViews;
