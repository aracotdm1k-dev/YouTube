import {
  IoCarSportOutline,
  IoFilmOutline,
  IoGameControllerOutline,
  IoHomeOutline,
  IoMusicalNotesOutline,
  IoNewspaperOutline,
  IoPhonePortraitOutline,
  IoRadioOutline,
  IoReaderOutline,
  IoRibbonOutline,
  IoSchoolOutline,
  IoTvOutline,
} from 'react-icons/io5'

export const categories = [
  { slug: 'home', label: 'Home', chipLabel: 'All', icon: IoHomeOutline, videoCategoryId: null, searchKeyword: '' },
  { slug: 'gaming', label: 'Gaming', icon: IoGameControllerOutline, videoCategoryId: '20', searchKeyword: 'gaming' },
  { slug: 'automobiles', label: 'Automobiles', icon: IoCarSportOutline, videoCategoryId: '2', searchKeyword: 'car reviews' },
  { slug: 'sports', label: 'Sports', icon: IoRibbonOutline, videoCategoryId: '17', searchKeyword: 'sports highlights' },
  { slug: 'entertainment', label: 'Entertainment', icon: IoTvOutline, videoCategoryId: '24', searchKeyword: 'movie trailers entertainment' },
  { slug: 'technology', label: 'Technology', icon: IoPhonePortraitOutline, videoCategoryId: '28', searchKeyword: 'tech news' },
  { slug: 'music', label: 'Music', icon: IoMusicalNotesOutline, videoCategoryId: '10', searchKeyword: 'music videos' },
  { slug: 'blogs', label: 'Blogs', icon: IoReaderOutline, videoCategoryId: '22', searchKeyword: 'people and blogs' },
  { slug: 'news', label: 'News', icon: IoNewspaperOutline, videoCategoryId: '25', searchKeyword: 'news' },
  { slug: 'movies', label: 'Movies', icon: IoFilmOutline, videoCategoryId: '1', searchKeyword: 'movies film animation' },
  { slug: 'education', label: 'Education', icon: IoSchoolOutline, videoCategoryId: '27', searchKeyword: 'education learning' },
  { slug: 'live', label: 'Live', icon: IoRadioOutline, videoCategoryId: null, searchKeyword: 'live' },
]

export const sidebarCategories = categories.filter(({ slug }) => !['movies', 'education', 'live'].includes(slug))
export const chipCategories = categories.filter(({ slug }) => ['home', 'music', 'gaming', 'technology', 'sports', 'movies', 'education', 'live'].includes(slug))