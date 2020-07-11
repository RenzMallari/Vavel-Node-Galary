import React from "react"; 
import PlacesAutocomplete from 'react-places-autocomplete';

const logo = "/static/images/powered-by-google-on-white3.png";
const location = "/static/images/icon-location@2x.png";

function Google({ place, handlePlace, handleSelect }) {
  return (
    <PlacesAutocomplete
      value={place}
      onChange={handlePlace}
      onSelect={handleSelect}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div className="location-box-cover">
          <input
            {...getInputProps({
              placeholder: 'Enter address',
              className: 'location-search-input',
            })}
          />
          {suggestions.length > 0 && 
          <div className="autocomplete-dropdown-container">
            {loading && <div>Loading...</div>}
            {suggestions.map(suggestion => { 
              const className = 'suggestion-item';
              const style = suggestion.active
                ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                : { backgroundColor: '#ffffff', cursor: 'pointer' };
              return (
                <div
                  {...getSuggestionItemProps(suggestion, {
                    className,
                    style,
                  })}
                >
                  <p style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 0
                  }}>
                  <img src={location} alt="logo-search-location" />
                  <strong>
                    {suggestion.formattedSuggestion.mainText}
                  </strong>{' '}
                  <small>
                    {suggestion.formattedSuggestion.secondaryText}
                  </small>
                  </p>
                </div>
              );
            })}
            <div className="dropdown-footer">
              <div>
                <img
                  src={logo}
                  alt="logo-search-adress"
                  className="dropdown-footer-image"
                />
              </div>
            </div>
          </div>}
        </div>
      )}
    </PlacesAutocomplete>
  )
}

export default Google;
