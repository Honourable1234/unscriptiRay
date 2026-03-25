import { CharacterCard } from '@/components/explore/CharacterCard';
import { FilterDropdown } from '@/components/explore/FilterDropdown';
import { SearchBar } from '@/components/explore/SearchBar';
import { TagFilter } from '@/components/explore/TagFilter';
// import { Env } from '@/libs/Env';
import { characters } from '@/data/characters';

export default function ExplorePage() {
  return (
    <div>
      <h1 className="mt-2.5 mb-10 text-center text-xl font-bold text-white sm:text-2xl md:text-[32px]">
        Explore Your
        <span className="text-primary-100">Fantasies</span>
      </h1>
      <SearchBar />
      <div className="mt-3 hidden flex-wrap items-start gap-2 md:flex">
        <FilterDropdown label="Identity" value="Male" options={['Male', 'Female', 'Futa', 'Androgynous']} />
        <FilterDropdown label="Visual Style" value="Anime" options={['Ultra-Real', 'Anime', '3D Sculpted', 'Stylized']} />
        <FilterDropdown label="Age Range" value="18-25" options={['18-25', '25-35', '35+']} />
        <FilterDropdown label="Vibe" value="Soft" options={['Soft', 'Playful', 'Seductive', 'Dominant', 'Dark', 'Cute']} />
        <FilterDropdown label="Sort" value="Trending" options={['Trending', 'Newly Born', 'Most Engaged', 'Editor Picks']} />
      </div>
      <div className="mt-3 mb-4">
        <TagFilter />
      </div>

      <div className="flex flex-wrap gap-2">
        {characters.slice(0, 10).map(character => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}
