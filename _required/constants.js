module.exports = {

    sanitize_whitespaces(string) {
        return string.replace(/\s+/gm, ` `).trim();
    },

    capitalize(string) {
        return string.toLowerCase().split(` `).map(
            word => word.charAt(0).toUpperCase() + word.substring(1)
        ).join(` `);
    },

    sanitize_start(string) {
        return string.match(/(?<=Du\s+).*(?=\s+au)/gmi).join(``).replace(/\/|:| /g, `, `).split(`, `);
    },

    sanitize_end(string) {
        return string.split(` au `)[1].slice(0, 14).replace(/\/|:| /g, `, `).split(`, `);
    },

    sanitize_contact(string) {
        return string.match(/^.*\d{10,}/gm);
    },

    sanitize_instructor_firstname(string) {
        return string.match(/(?<=instruction avec\s+).*(?=\s+Du)/gmi).join(``).trim().split(` `)[0];
    },

    sanitize_instructor_lastname(string) {
        return string.match(/(?<=instruction avec\s+).*(?=\s+Du)/gmi).join(``).trim().split(` `)[1];
    },

    sanitize_organizer_firstname(string) {
        return string.toString().replace(/(.*) Réservé par: /, '').split(' ')[0]
    },

    sanitize_organizer_lastname(string) {
        return string.toString().replace(/(.*) Réservé par: /, '').split(' ')[1]
    },

    sanitize_attendee_firstname(string) {
        return string.match(/(?<=Réservation effectuée pour\s+).*(?=\s+Du)/gmi).join(``).trim().split(` `)[0];
    },

    sanitize_attendee_lastname(string) {
        return string.match(/(?<=Réservation effectuée pour\s+).*(?=\s+Du)/gmi).join(``).trim().split(` `)[1];
    },

    sanitize_destination(string) {
        return string.match(/(?<=Destination:\s+).*(?=\s+Réservé par:)/gmi);
    },

};