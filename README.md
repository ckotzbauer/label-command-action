# Label Command Action

![build](https://github.com/ckotzbauer/label-command-action/workflows/build/badge.svg)
A GitHub action to label issues or PRs with specified commands.

## Usage

```yml
      - uses: actions/checkout@v2
      - name: Label Issues and PRs
        uses: ckotzbauer/label-command-action@v1
        env:
          GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
```

## Config



### Action inputs

| Name | Description | Default |
| --- | --- | --- |
| `token` | `GITHUB_TOKEN` or a `repo` scoped [PAT](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). | `GITHUB_TOKEN` |
| `config-file` | Location of the config file. | `.github/label-commands.json` |


## License

[MIT](LICENSE)
