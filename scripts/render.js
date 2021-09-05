const fs = require('fs');

const Handlebars = require("handlebars");
const templateFileContents = fs.readFileSync('./public/asteroid-alert-template.hbs', { encoding: 'utf-8'});
const template = Handlebars.compile(templateFileContents);
if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}

fs.writeFileSync('./dist/test.html', template({
    potentiallyDangerousNeos: [
        {
            name: "test",
            url: "google.com",
            miss_distance: "123,123,123 mi.",
            diameter: "0.025 mi.",
        }
    ],
    nonThreateningNeos: [
        {
            name: "test",
            url: "google.com",
            miss_distance: "123,123,123 mi.",
            diameter: "0.025 mi.",
        }
    ]
}), {encoding: 'utf-8'});