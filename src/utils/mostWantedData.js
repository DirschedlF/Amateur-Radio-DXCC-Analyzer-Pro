// Most Wanted DXCC Data
// Rankings based on ClubLog's Most Wanted survey
// Data structure: Map of DXCC ID -> { prefix, rank, neededPercent }

import DigitalCSV from './Digital.csv?raw';
import CWCSV from './CW.csv?raw';
import PhoneCSV from './Phone.csv?raw';
import MixedCSV from './Mixed.csv?raw';

// Manual mapping for entities with N/A ADIF codes in ClubLog CSV
// Maps ClubLog entity names to standard ADIF DXCC codes
const NA_ENTITY_MAPPING = {
  'Cayman Islands': '69',
  'Mauritius Island': '165',
  'Rodrigues Island': '207',
  'US Virgin Islands': '285',
  'Tristan da Cunha & Gough Islands': '274',
  'Pitcairn Island': '172',
  "Ducie Island": '513',
  'Clipperton Island': '36',
  'Juan Fernandez Islands': '125',
  'Easter Island': '47',
  'Sov Military Order of Malta': '246',
  'ITU HQ': '117',
  'United Nations HQ': '289',
  'Market Reef': '167',
  'Fiji Islands': '176',
  'Mariana Islands': '166',
  'Marshall Islands': '168',
  'Turks & Caicos Islands': '89',
  'Saint Pierre & Miquelon': '277',
  'Saba & St Eustatius': '519',
  'Central African Republic': '408',
  'Republic of South Sudan': '521',
  'Spratly Islands': '247',
  'Annobon': '195',
  'Malpelo Island': '161',
  'San Andres Island': '216',
  'UK Bases on Cyprus': '283',
  'Brunei': '345',
  'Federal Republic of Germany': '230'
};

/**
 * Parse CSV data into Maps keyed by ADIF Code and by entity name
 * @param {string} csvText - Raw CSV text
 * @returns {{byCode: Map, byName: Map}}
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const byCode = new Map();
  const byName = new Map();

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV: Rank,Prefix,Entity,ADIF Code,Needed %
    // Use regex to properly parse CSV with possible quoted fields
    const regex = /(?:^|,)(?:"([^"]*)"|([^",]*))/g;
    const parts = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      parts.push(match[1] !== undefined ? match[1] : match[2]);
    }

    if (parts.length < 5) continue;

    const rank = parseInt(parts[0], 10);
    const prefix = parts[1].trim();
    const entityName = parts[2].trim();
    const adifCode = parts[3].trim();
    const neededPercent = parts[4].trim();

    if (isNaN(rank)) continue;

    const entryData = { prefix, rank, neededPercent };

    // Store by ADIF code if available
    if (adifCode !== 'N/A' && adifCode) {
      byCode.set(adifCode, entryData);
    }

    // Store by entity name for N/A cases
    byName.set(entityName, entryData);

    // Check manual mapping for N/A entities
    if ((adifCode === 'N/A' || !adifCode) && NA_ENTITY_MAPPING[entityName]) {
      byCode.set(NA_ENTITY_MAPPING[entityName], entryData);
    }
  }

  return { byCode, byName };
}

// Parse all CSV files
const digitalData = parseCSV(DigitalCSV);
const cwData = parseCSV(CWCSV);
const phoneData = parseCSV(PhoneCSV);
const mixedData = parseCSV(MixedCSV);

/**
 * Get Most Wanted data for a specific DXCC entity and mode
 * Falls back to Mixed data if not found in the specified mode
 * @param {string|number} dxccId - DXCC entity ID
 * @param {string} mode - Mode: 'Digital', 'CW', 'SSB', or 'All'
 * @returns {{prefix: string, rank: number, neededPercent: string} | null}
 */
export function getMostWantedData(dxccId, mode = 'All') {
  const id = String(dxccId);
  let result = null;

  switch (mode) {
    case 'Digital':
      result = digitalData.byCode.get(id);
      break;
    case 'CW':
      result = cwData.byCode.get(id);
      break;
    case 'SSB':
      result = phoneData.byCode.get(id);
      break;
    case 'All':
    default:
      result = mixedData.byCode.get(id);
  }

  // Fallback to Mixed data if not found in specific mode
  if (!result && mode !== 'All') {
    result = mixedData.byCode.get(id);
  }

  return result || null;
}

/**
 * Get the prefix (main callsign) for a DXCC entity
 * Falls back to other modes if not found in the specified mode
 * @param {string|number} dxccId - DXCC entity ID
 * @param {string} mode - Mode: 'Digital', 'CW', 'SSB', or 'All'
 * @returns {string | null}
 */
export function getDXCCPrefix(dxccId, mode = 'All') {
  const data = getMostWantedData(dxccId, mode);
  if (data) return data.prefix;

  // Fallback: try to find in any mode
  const id = String(dxccId);
  return mixedData.byCode.get(id)?.prefix ||
         digitalData.byCode.get(id)?.prefix ||
         cwData.byCode.get(id)?.prefix ||
         phoneData.byCode.get(id)?.prefix ||
         null;
}

/**
 * Get the rank for a DXCC entity
 * @param {string|number} dxccId - DXCC entity ID
 * @param {string} mode - Mode: 'Digital', 'CW', 'SSB', or 'All'
 * @returns {number | null}
 */
export function getMostWantedRank(dxccId, mode = 'All') {
  const data = getMostWantedData(dxccId, mode);
  return data ? data.rank : null;
}

/**
 * Get all Most Wanted data for debugging/testing
 * @returns {object}
 */
export function getAllMostWantedData() {
  return {
    digital: Object.fromEntries(digitalData.byCode),
    cw: Object.fromEntries(cwData.byCode),
    phone: Object.fromEntries(phoneData.byCode),
    mixed: Object.fromEntries(mixedData.byCode)
  };
}
