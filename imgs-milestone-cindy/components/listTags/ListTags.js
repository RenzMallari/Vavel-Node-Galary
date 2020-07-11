import React from "react";
import { useSelector } from "react-redux";
import classnames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

import { Tag, Paddle } from "../common";

let prevSortTagList = [];

function ListTags({ listTags = [], link = "/", linktag }) {
  const router = useRouter();
  const query = router.query || {};
  const tag = query.tag || null;

  const storeTagList = useSelector(store => store.listTags.data);

  let sortTagList = [];
  if (storeTagList.length && listTags.length) {
    const list = listTags.map(item => item.tag);
    const datas = storeTagList.filter(item => {
      return list.indexOf(item._id) !== -1;
    });
    const result = datas.map(item => {
      const list_tags = item.list_tags;
      const findTag = list_tags.find(item => {
        return item.logo !== undefined;
      });
      if (findTag === undefined) {
        return {
          id: item._id
        };
      }
      return {
        id: item._id,
        logo: findTag.logo
      };
    });
    const findTag = result.find(item => item.id === tag);
    const index = result.indexOf(findTag);
    sortTagList =
      index !== -1
        ? [result[index], ...result.slice(0, index), ...result.slice(index + 1)]
        : result;
  }

  // not reset listtags on top when change to another tag page
  if (sortTagList.length === 0 && router.asPath.includes("tag")) {
    sortTagList = prevSortTagList;
  } else {
    prevSortTagList = sortTagList;
  }

  return (
    <div className="tag-wrapper">
      <div id="tag-list" className="tag-list">
        <Link href={link}>
          <a
            className={classnames("all", {
              taga: tag
            })}
          >
            ALL
          </a>
        </Link>
        {sortTagList.length > 0 &&
          sortTagList.map((item, index) => (
            <Tag
              key={index}
              tag={item.id}
              url={item.logo || null}
              activeTag={tag}
              linktag={linktag}
            />
          ))}
      </div>
      <Paddle
        id="tag-list"
        idLeft="tag-list-left"
        idRight="tag-list-right"
        topAbolute="20%"
      />
    </div>
  );
}

export default ListTags;
