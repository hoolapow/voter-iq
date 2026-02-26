// State FIPS → capital/main city zipcode
// Used by the county API route to translate FIPS into a Civic API-compatible zipcode

export const STATE_ZIPCODES: Record<string, string> = {
  '01': '36104', // Alabama - Montgomery
  '02': '99801', // Alaska - Juneau
  '04': '85001', // Arizona - Phoenix
  '05': '72201', // Arkansas - Little Rock
  '06': '95814', // California - Sacramento
  '08': '80203', // Colorado - Denver
  '09': '06103', // Connecticut - Hartford
  '10': '19901', // Delaware - Dover
  '11': '20001', // District of Columbia - Washington DC
  '12': '32301', // Florida - Tallahassee
  '13': '30303', // Georgia - Atlanta
  '15': '96813', // Hawaii - Honolulu
  '16': '83702', // Idaho - Boise
  '17': '62701', // Illinois - Springfield
  '18': '46204', // Indiana - Indianapolis
  '19': '50309', // Iowa - Des Moines
  '20': '66612', // Kansas - Topeka
  '21': '40601', // Kentucky - Frankfort
  '22': '70801', // Louisiana - Baton Rouge
  '23': '04330', // Maine - Augusta
  '24': '21401', // Maryland - Annapolis
  '25': '02108', // Massachusetts - Boston
  '26': '48933', // Michigan - Lansing
  '27': '55101', // Minnesota - Saint Paul
  '28': '39201', // Mississippi - Jackson
  '29': '65101', // Missouri - Jefferson City
  '30': '59601', // Montana - Helena
  '31': '68508', // Nebraska - Lincoln
  '32': '89701', // Nevada - Carson City
  '33': '03301', // New Hampshire - Concord
  '34': '08608', // New Jersey - Trenton
  '35': '87501', // New Mexico - Santa Fe
  '36': '12207', // New York - Albany
  '37': '27601', // North Carolina - Raleigh
  '38': '58501', // North Dakota - Bismarck
  '39': '43215', // Ohio - Columbus
  '40': '73102', // Oklahoma - Oklahoma City
  '41': '97301', // Oregon - Salem
  '42': '17101', // Pennsylvania - Harrisburg
  '44': '02903', // Rhode Island - Providence
  '45': '29201', // South Carolina - Columbia
  '46': '57501', // South Dakota - Pierre
  '47': '37219', // Tennessee - Nashville
  '48': '78701', // Texas - Austin
  '49': '84111', // Utah - Salt Lake City
  '50': '05602', // Vermont - Montpelier
  '51': '23219', // Virginia - Richmond
  '53': '98501', // Washington - Olympia
  '54': '25301', // West Virginia - Charleston
  '55': '53703', // Wisconsin - Madison
  '56': '82001', // Wyoming - Cheyenne
}
