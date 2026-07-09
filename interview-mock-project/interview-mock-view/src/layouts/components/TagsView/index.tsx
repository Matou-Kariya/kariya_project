import { CloseOutlined, HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { DbMenu } from "@/types/menu";
import "./index.css";

type TagItem = {
  path: string;
  title: string;
  fixed?: boolean;
};

const HOME_TAG: TagItem = {
  path: "/dashboard",
  title: "工作台",
  fixed: true,
};

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function findMenuName(menus: DbMenu[], pathname: string): string | undefined {
  for (const menu of menus) {
    const path = normalizePath(menu.path);

    if (path === pathname) return menu.menuName;

    if (menu.children?.length) {
      const name = findMenuName(menu.children, pathname);
      if (name) return name;
    }
  }
}

export function TagsView() {
  const location = useLocation();
  const navigate = useNavigate();
  const menus = useSelector((state: RootState) => state.user.menus);

  const currentTitle = useMemo(() => {
    if (location.pathname === "/dashboard") return HOME_TAG.title;
    return findMenuName(menus, location.pathname) || location.pathname;
  }, [menus, location.pathname]);

  const [tags, setTags] = useState<TagItem[]>([HOME_TAG]);

  useEffect(() => {
    if (location.pathname === "/login") return;

    setTags((prev) => {
      if (prev.some((item) => item.path === location.pathname)) {
        return prev;
      }

      return [
        ...prev,
        {
          path: location.pathname,
          title: currentTitle,
        },
      ];
    });
  }, [location.pathname, currentTitle]);

  const handleClose = (tag: TagItem) => {
    if (tag.fixed) return;

    setTags((prev) => {
      const nextTags = prev.filter((item) => item.path !== tag.path);

      if (location.pathname === tag.path) {
        const closedIndex = prev.findIndex((item) => item.path === tag.path);
        const nextActive = nextTags[closedIndex - 1] || nextTags[closedIndex] || HOME_TAG;
        navigate(nextActive.path);
      }

      return nextTags;
    });
  };

  return (
    <div className="tags-view">
      <div className="tags-view__list">
        {tags.map((tag) => {
          const active = tag.path === location.pathname;

          return (
            <div key={tag.path} className={active ? "tags-view__tag tags-view__tag--active" : "tags-view__tag"} onClick={() => navigate(tag.path)}>
              {tag.fixed && <HomeOutlined />}
              <span>{tag.title}</span>

              {!tag.fixed && (
                <CloseOutlined
                  className="tags-view__close"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClose(tag);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="tags-view__actions">
        <Button className="tags-view__refresh" icon={<ReloadOutlined />} onClick={() => navigate(0)} />
      </div>
    </div>
  );
}
