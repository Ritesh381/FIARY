import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setNavItems } from "../redux/slices/NavItems";
import shelfApi from "../api/ShelfCalls";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import BookShelf from "../components/shelf/BookShelf";
import MovieShelf from "../components/shelf/MovieShelf";
import CustomShelf from "../components/shelf/CustomShelf";
import CustomShelfForm from "../components/shelf/CustomShelfForm";

// item creation forms
import BookItemForm from "../components/shelf/BookItemForm";
import MovieItemForm from "../components/shelf/MovieItemForm";
import CustomShelfItemForm from "../components/shelf/CustomShelfItemForm";

export default function TheShelf() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [shelves, setShelves] = useState([]);
  const [selectedPage, setSelectedPage] = useState("Home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previews, setPreviews] = useState({});

  // Fetch shelves and build nav
  useEffect(() => {
    let mounted = true;
    const fetchShelves = async () => {
      try {
        setLoading(true);
        const data = await shelfApi.getShelves();
        const fetchedShelves = data.shelves || [];
        if (!mounted) return;

        setShelves(fetchedShelves);

        const navItems = [
          { id: 0, type: "link", name: "Home", link: "/shelf" },
          ...fetchedShelves.map((shelf, i) => ({
            id: i + 1,
            type: "link",
            name: shelf.name,
            link: `/shelf?page=${i + 1}`,
          })),
        ];
        dispatch(setNavItems(navItems));

        // load preview data for home
        const previewPromises = fetchedShelves.map(async (shelf) => {
          try {
            const items = await shelfApi.getItemsByShelf(shelf._id);
            return { shelfId: shelf._id, items: (items || []).slice(0, 3) };
          } catch {
            return { shelfId: shelf._id, items: [] };
          }
        });

        const previewResults = await Promise.all(previewPromises);
        const previewMap = {};
        previewResults.forEach((p) => (previewMap[p.shelfId] = p.items));
        if (mounted) setPreviews(previewMap);

        // sync page with query param
        const params = new URLSearchParams(location.search);
        const pageParam = params.get("page");
        if (!pageParam) {
          setSelectedPage("Home");
        } else {
          const pageNum = parseInt(pageParam, 10);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= fetchedShelves.length) {
            setSelectedPage(fetchedShelves[pageNum - 1].name);
          } else {
            setSelectedPage("Home");
          }
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load shelves");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchShelves();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // Keep selectedPage in sync when query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get("page");
    if (!pageParam) {
      setSelectedPage("Home");
      return;
    }
    const pageNum = parseInt(pageParam, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= shelves.length) {
      setSelectedPage(shelves[pageNum - 1].name);
    } else {
      setSelectedPage("Home");
    }
  }, [location.search, shelves]);

  useEffect(() => {
    setShowCreateModal(false);
  }, [selectedPage]);


  // Change page
  const handleSelectShelf = (index, shelfName) => {
    if (index === 0) {
      navigate("/shelf", { replace: false });
      setSelectedPage("Home");
    } else {
      navigate(`/shelf?page=${index}`, { replace: false });
      setSelectedPage(shelfName);
    }
  };

  const renderShelf = () => {
    if (selectedPage === "Home") return renderHome();
    const shelf = shelves.find((s) => s.name === selectedPage);
    if (!shelf) return <div className="text-gray-300">Shelf not found.</div>;
    if (shelf.type === "book") return <BookShelf shelf={shelf} />;
    if (shelf.type === "movie") return <MovieShelf shelf={shelf} />;
    return <CustomShelf shelf={shelf} />;
  };

  const renderHome = () => (
    <div >
      {shelves.length === 0 ? (
        <div className="text-gray-400">No shelves yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shelves.map((shelf, i) => {
            const preview = previews[shelf._id] || [];
            return (
              <div
                key={shelf._id}
                className="bg-white/5 backdrop-blur rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectShelf(i + 1, shelf.name)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{shelf.name}</h3>
                    <p className="text-sm text-gray-300">{shelf.type}</p>
                  </div>
                  <button
                    onClick={() => handleSelectShelf(i + 1, shelf.name)}
                    className="text-sm px-3 py-1 bg-teal-600 rounded text-white"
                  >
                    Open
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {preview.length === 0 ? (
                    <div className="col-span-3 text-gray-400 text-sm">
                      No items yet
                    </div>
                  ) : (
                    preview.map((item) => (
                      <div key={item._id} className="h-24 overflow-hidden rounded">
                        {/* ✅ Support books, movies, and custom shelves */}
                        {(() => {
                          const imgSrc = (() => {
                            if (
                              item.data?.cover_image ||
                              item.data?.thumbnail ||
                              item.data?.smallThumbnail ||
                              item.data?.poster ||
                              item.data?.backdrop ||
                              item.data?.cover ||
                              item.data?.coverImage
                            ) {
                              return (
                                item.data?.cover_image ||
                                item.data?.thumbnail ||
                                item.data?.smallThumbnail ||
                                item.data?.poster ||
                                item.data?.backdrop ||
                                item.data?.cover ||
                                item.data?.coverImage
                              );
                            }

                            if (item.schema && Array.isArray(item.schema)) {
                              const photoField = item.schema.find((field) => field.type === "photo");
                              console.log("photoField:", photoField);
                              if (photoField && item.data?.[photoField.key]) {
                                return item.data[photoField.key];
                              }
                            }
                            return null;
                          })();
                          if (imgSrc) {
                            return (
                              <img
                                src={imgSrc}
                                alt={item.data?.title || "item"}
                                className="w-full h-full object-contain rounded"
                              />
                            );
                          }

                          return (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                              No Image
                            </div>
                          );
                        })()}

                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 text-sm text-gray-300">
                  <span>{preview.length}</span> previewed item(s)
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Pick the correct form based on page
  const renderCreateButton = () => {
    if (selectedPage === "Home") {
      return (
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          <span>Create Custom Shelf</span>
        </button>
      );
    }

    const shelf = shelves.find((s) => s.name === selectedPage);
    if (!shelf) return null;

    return (
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Plus size={20} />
        <span>Add {shelf.type === "book" ? "Book" : shelf.type === "movie" ? "Movie" : "Item"}</span>
      </button>
    );
  };

  const renderCreateModal = () => {
    if (!showCreateModal) return null;
    if (selectedPage === "Home")
      return (
        <CustomShelfForm
          onClose={() => setShowCreateModal(false)}
        />
      );

    const shelf = shelves.find((s) => s.name === selectedPage);
    if (!shelf) return null;

    if (shelf.type === "book")
      return (
        <BookItemForm
          shelf={shelf}
          onClose={() => setShowCreateModal(false)}
        />
      );
    if (shelf.type === "movie")
      return (
        <MovieItemForm
          shelf={shelf}
          onClose={() => setShowCreateModal(false)}
        />
      );
    return (
      <CustomShelfItemForm
        shelf={shelf}
        onClose={() => setShowCreateModal(false)}
      />
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        <Loader2 className="animate-spin mr-2" /> Loading shelves...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        <AlertTriangle className="mr-2" /> {error}
      </div>
    );

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">The Shelf</h1>
        {renderCreateButton()}
      </div>

      {renderShelf()}

      {renderCreateModal()}
    </div>
  );
}
