document.addEventListener('DOMContentLoaded', async function() {
    await renderProjectsAndVersions();
});

async function renderProjectsAndVersions() {
    const projectsDropdown = document.getElementById("project-drop-down");

    projectsDropdown.appendChild(
        Object.assign(
            document.createElement('option'), {
                selected: true,
                value: "select",
                text: "Select a Project",
                disabled: true
            }
        )
    );

    const projects = await getFileContent("./Projects/info.json");

    projects.forEach(filePath => {
        projectsDropdown.appendChild(
            Object.assign(document.createElement('option'), { value: filePath, text: filePath })
        );
    });

    if (projects.length > 0) {
        projectsDropdown.selectedIndex = 1; 
        handleProjectChange(projects[0]); 
    }

    projectsDropdown.style.display = 'block';

    projectsDropdown.addEventListener('change', (event) => {
        handleProjectChange(event.target.value);
    });
}

async function handleProjectChange(selectedProject) {
    var previouslySelectedRelease = null;

    const versions = document.getElementById("versions");
    versions.innerHTML = "<h2>Versions</h2>";

    const releaseNotes = document.getElementById('release-notes');
    releaseNotes.innerHTML = "<h3>Select a version to view the release notes.</h3>";

    const selectedProjectVersions = await getFileContent(`Projects/${selectedProject}/info.json`);
    const versionKeys = Object.keys(selectedProjectVersions);

    versionKeys.forEach((version, index) => {
        const versionsDivEle = document.createElement('div');
        versionsDivEle.className = "version";
        versionsDivEle.innerHTML = `${version} <b style="float: right;">(${selectedProjectVersions[version]})</b>`;
        
        versionsDivEle.addEventListener('click', function() {
            if (previouslySelectedRelease) {
                previouslySelectedRelease.classList.remove('selected-version');
            }
            this.classList.add('selected-version');
            previouslySelectedRelease = this;
            showReleaseNotes(`./Projects/${selectedProject}/${version}.html`);
        });
        
        versions.appendChild(versionsDivEle);
        if (index === 0) {
            versionsDivEle.click();
        }
    });
}

async function getFileContent(filePath, shouldNotParse) {
    var fileContent = "";
    await fetch(filePath).then(async (resp) => {
        for await (const content of resp.body) {
            fileContent = new TextDecoder().decode(content);
        }
    });
    return shouldNotParse ? fileContent : JSON.parse(fileContent);
}

async function showReleaseNotes(releaseFilePath) {
    document.getElementById('release-notes').innerHTML = await getFileContent(releaseFilePath, true) || '<h3>Release notes not available.</h3>';
}
