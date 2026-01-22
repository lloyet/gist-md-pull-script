import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import simpleGit from "simple-git";

dotenv.config();

const GITHUB_USER = process.env.GITHUB_USER ?? "test";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/gists`;
const OUTPUT_PATH = path.basename(".gists");
const PER_PAGE = 100;

(async () => {
	try {
		const git = simpleGit();

		let gitRepoCloned = 0;
		let page = 0;
		let gists = [null];

		if (!fs.existsSync(OUTPUT_PATH)) fs.mkdirSync(OUTPUT_PATH);

		while (gists.length !== 0) {
			const response = await fetch(
				`${API_URL}?per_page=${PER_PAGE}&page=${page}`,
			);

			if (!response.ok) break;

			gists = await response.json();

			for (const gist of gists) {
				const filenames = Object.keys(gist.files);

				if (!filenames.length) continue;

				const gitPullUrl = gist.git_pull_url;
				const gistRepoName = filenames[0].split(".")[0];

				console.log(`Cloning repository ${gistRepoName}`);

				git.clone(gitPullUrl, `${OUTPUT_PATH}/${gistRepoName}`);

				gitRepoCloned++;
				/*
				

				for (const filename of filenames) {
					const gistFile = gist.files[filename];

					if (!gistFile || !gistFile.raw_url) continue;

					const responseFile = await fetch(gistFile.raw_url);

					if (!responseFile.ok) continue;

					const fileData = await responseFile.text();

					fs.writeFileSync(`${OUTPUT_PATH}/${filename}`, fileData, {
						encoding: "utf-8",
					});

					console.log(`File ${filename} downloaded.`);

					filesDownloaded++;
				}*/
			}

			page++;
		}

		console.log(`Cloned ${gitRepoCloned} repositories.`);
	} catch (err) {
		console.error(err);
	}
})();
